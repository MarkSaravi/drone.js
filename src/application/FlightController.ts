import FlightState from '../models/FlightState';
import Command from '../models/Command';
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

export default class FlightController {
    private actualFlightState: FlightState;
    private targetFlightState: FlightState;
    private imuData: ImuData = null;
    private readonly pidRoll: PIDControl = new PIDControl("roll");
    private readonly pidPitch: PIDControl = new PIDControl("pitch");
    private readonly pidYaw: PIDControl = new PIDControl("yaw");
    private prevTime: number = 0;

    constructor(private config: IFlightConfig) {
        if (this.config.useRollPIDForPitchPID && this.config.debug != 'yaw') {
            this.config.pitchPID = this.config.rollPID;
        }
        this.actualFlightState = new FlightState(0, 0, 0, 0, 0);
        this.targetFlightState = new FlightState(0, 0, 0, 0, 0);
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
        // {"state":2,"roll":2.5,"pitch":2.5,"yaw":2.4,"power":0.0,"time":-22764}
        try{
            const cmd = JSON.parse(cmdJson);
            // this.command = new Command(cmd.roll, cmd.pitch, cmd.yaw, cmd.power, cmd.state, cmd.time);
            // this.targetFlightState = convertors.JsonToCommand(this.command, this.targetFlightState);
        } catch(err){
        }
    }

    applyImuData(rawImuData: ImuData) {
        this.imuData = {
            roll: rawImuData.roll,
            pitch: rawImuData.pitch,
            yaw: rawImuData.yaw,
            time: rawImuData.time
        };
        this.actualFlightState = convertors.ImuDataToFlightStatus(this.imuData);
    }

    calcPairPower(power: number, pid: IPIDValue): IArmPower {
        return frontBackPower(power, pid);
    }

    calcMotorsPower(): IPowers {
        let errors: IFlightStateError = getStateError(this.targetFlightState, this.actualFlightState, this.config);
        const rollError = !this.config.suppress.roll ? (errors.rollError - this.config.rollOffset): 0;
        const pitchError = !this.config.suppress.pitch ? (errors.pitchError - this.config.pitchOffset) : 0;
        const yawError = !this.config.suppress.yaw ? errors.yawError : 0;
        const basePower = this.targetFlightState.power;
        const dt = errors.time - this.prevTime;
        this.prevTime = errors.time;
        if (basePower >= this.config.minPower) {
            const rollPIDResult = this.pidRoll.PID(rollError, this.actualFlightState.roll, errors.time, this.config.rollPID);
            const pitchPIDResult = this.pidPitch.PID(pitchError, this.actualFlightState.pitch, errors.time, this.config.pitchPID);
            const yawPIDResult = this.pidYaw.PID(yawError, -yawError, errors.time, this.config.yawPID);
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
            showStatus(basePower, rollBasePower, pitchBasePower, this.config, {
                rollError,
                pitchError,
                yawError,
                time: dt
            }, rollPIDResult, pitchPIDResult, yawPIDResult);
            return powers;
        } else {
            showStatus(basePower, basePower, basePower, this.config, errors, null, null, null);
            return { a: 0, b: 0, c: 0, d: 0 };
        }
    }
}