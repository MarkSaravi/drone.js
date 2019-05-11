import IFlightState from '../models/IFlightState';
import ImuData from '../models/ImuData';
import getStateError from '../flight-logics/getStateErrors';
import IFlightStateError from '../models/IFlightStateError';
import * as convertors from '../convertors';
import IPowers from '../models/IPowers';
import IFlightConfig from '../models/IFlightConfig';
import { IPIDValue } from '../models/IPIDValue';
import PIDControl from '../flight-logics/PIDControl';
import showStatus from '../utilities';
import IArmPower from '../models/IArmPower';
import { frontBackPower } from '../flight-logics/front-back-power';
import commandToFlightState from '../convertors/command-to-flightstate';

export default class FlightController {
    private actualFlightState: IFlightState;
    private targetFlightState: IFlightState;
    private time: number = 0;
    private power: number = 0;
    private isRemoteSynced = false;
    private imuData: ImuData = null;
    private readonly pidRoll: PIDControl = new PIDControl("roll");
    private readonly pidPitch: PIDControl = new PIDControl("pitch");
    private readonly pidYaw: PIDControl = new PIDControl("yaw");
    private prevTime: number = 0;

    constructor(private config: IFlightConfig) {
        if (this.config.useRollPIDForPitchPID && this.config.debug != 'yaw') {
            this.config.pitchPID = this.config.rollPID;
        }
        this.actualFlightState = { roll: 0, pitch: 0, yaw: 0 };
        this.targetFlightState = { roll: 0, pitch: 0, yaw: 0 };
    }

    invalidateRemoteSync() {
        this.power = 0;
        this.isRemoteSynced = false;
    }

    toggleRollPitchTuning() {
        if (this.config.debug == 'roll') {
            this.config.debug = 'pitch';
        } else if (this.config.debug == 'pitch') {
            this.config.debug = 'roll';
        }
    }
    
    incRollOffset() {
        this.config.rollOffset += this.config.rollOffsetInc;
    }

    decRollOffset() {
        this.config.rollOffset -= this.config.rollOffsetInc;
    }
    
    incPitchOffset() {
        this.config.pitchOffset += this.config.pitchOffsetInc;
    }
    
    decPitchOffset() {
        this.config.pitchOffset -= this.config.pitchOffsetInc;
    }
    
    getPIDConfig() {
        switch(this.config.debug) {
            case 'roll':
                return this.config.rollPID;
            case 'pitch':
                return this.config.pitchPID;
            case 'yaw':
                return this.config.yawPID;
        }
        return null;
    }

    toggleUseGain(pidType: string) {
        let config = this.getPIDConfig();

        switch(pidType) {
            case 'p':
                config.usePGain = !config.usePGain;
                break;
            case 'i': 
                config.useIGain = !config.useIGain;
                break;
            case 'd':
                config.useDGain = !config.useDGain;
                break;
        }
    }

    incGain(pidType: string, inc: boolean) {
        let config = this.getPIDConfig();

        switch(pidType) {
            case 'p':
                config.pGain += inc ? config.pGainInc : -config.pGainInc;
                break;
            case 'i': 
                config.iGain += inc ? config.iGainInc : -config.iGainInc;
                break;
            case 'd':
                config.dGain += inc ? config.dGainInc : -config.dGainInc;
                break;
        }
    }

    resetYaw() {
        this.targetFlightState.yaw = this.actualFlightState.yaw;
    }

    applyIncomingCommand(cmdJson: string) {
        try{
            const { target , power, error } = commandToFlightState(cmdJson, this.targetFlightState, this.config.remoteControl);
            this.targetFlightState = target;
            this.power = !error ? power : this.power;
            if (!this.isRemoteSynced) {
                if (this.power == 0) {
                    this.isRemoteSynced = true;
                    console.log('remote synced 👍🏻');
                } else {
                    this.power = 0;
                }
            }
            if (this.power <= this.config.remoteControl.minPower) {
                this.resetYaw();
            }
        } catch(err){
        }
    }

    applyImuData(rawImuData: ImuData) {
        if (Math.abs(rawImuData.roll) > this.config.maxAngle ||
            Math.abs(rawImuData.pitch) > this.config.maxAngle) {
                console.log(`Invalidating remote sync ********************* roll: ${rawImuData.roll}, pitch: ${rawImuData.pitch}`);
                this.invalidateRemoteSync();
        }

        this.imuData = {
            roll: rawImuData.roll,
            pitch: rawImuData.pitch,
            yaw: rawImuData.yaw,
            time: rawImuData.time
        };
        const { imu, time } = convertors.ImuDataToFlightStatus(this.imuData);
        this.actualFlightState = imu;
        this.time = time;
    }

    calcPairPower(power: number, pid: IPIDValue): IArmPower {
        return frontBackPower(power, pid);
    }

    getTimeDifference() {
        const dt = this.time - this.prevTime;
        this.prevTime = this.time;
        return dt < 20 ? dt : 20; //limit to 20 milliseconds
    }

    calcErrors(): { rollError: number, pitchError: number; yawError: number; basePower: number; dt: number } {
        const errors: IFlightStateError = getStateError(this.targetFlightState, this.actualFlightState, this.config);
        const rollError = !this.config.suppress.roll ? (errors.rollError - this.config.rollOffset): 0;
        const pitchError = !this.config.suppress.pitch ? (errors.pitchError - this.config.pitchOffset) : 0;
        const yawError = !this.config.suppress.yaw ? errors.yawError : 0;
        const basePower = this.power;
        const dt = this.getTimeDifference();
        return {
            rollError, pitchError, yawError, basePower, dt
        }
    }
    
    calcMotorsPower(): IPowers {
        const { rollError, pitchError, yawError, basePower, dt } = this.calcErrors();
        const showError = { rollError, pitchError, yawError };
        if (basePower >= this.config.remoteControl.minPower) {
            const rollPIDResult = this.pidRoll.PID(rollError, this.actualFlightState.roll, this.time, this.config.rollPID);
            const pitchPIDResult = this.pidPitch.PID(pitchError, this.actualFlightState.pitch, this.time, this.config.pitchPID);
            const yawPIDResult = this.pidYaw.PID(yawError, -yawError, this.time, this.config.yawPID);
            const rollBasePower = basePower + yawPIDResult.sum;
            const pitchBasePower = basePower - yawPIDResult.sum;
            const rollPower = this.calcPairPower(rollBasePower, rollPIDResult);
            const pitchPower = this.calcPairPower(pitchBasePower, pitchPIDResult);
            const powers = {
                a: this.config.motors.a ? pitchPower.front : 0,
                b: this.config.motors.b ? rollPower.front : 0,
                c: this.config.motors.c ? pitchPower.back : 0,
                d: this.config.motors.d ? rollPower.back : 0
            };
            showStatus('+', this.isRemoteSynced, basePower, rollBasePower, pitchBasePower, this.config, showError, rollPIDResult, pitchPIDResult, yawPIDResult, dt);
            return powers;
        } else {
            showStatus('-', this.isRemoteSynced, basePower, basePower, basePower, this.config, showError, null, null, null, dt);
            return { a: 0, b: 0, c: 0, d: 0 };
        }
    }
}