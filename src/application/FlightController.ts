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
import { RpmArmPower } from '../flight-logics/front-back-power';

export default class FlightController {
    private actualFlightState: FlightState;
    private targetFlightState: FlightState;
    private imuData: ImuData = null;
    private pitchTilt: number = 0;
    private rollTilt: number = 0;
    private command: Command = new Command(0, 0, 0, 0);
    private heading: number = -1000;
    private readonly TILT_INC: number = 0.25;
    private readonly POWER_INC: number = 0.5;
    private readonly pidRoll: PIDControl = new PIDControl("roll");
    private readonly pidPitch: PIDControl = new PIDControl("pitch");
    private readonly pidYaw: PIDControl = new PIDControl("yaw");
    private prevTime: number = 0;

    constructor(private config: IFlightConfig) {
        if (this.config.useRollPIDForPitchPID && this.config.debug != 'yaw') {
            this.config.pitchPID = this.config.rollPID;
        }
        this.actualFlightState = new FlightState(0, 0, 0, 0, 0);
        this.targetFlightState = new FlightState(0, 0, NaN, 0, 0);
    }

    tiltForward() {
        this.pitchTilt += this.TILT_INC;
        this.targetFlightState = convertors.CommandToFlightStatus({ x: this.rollTilt, y: this.pitchTilt, heading: this.heading, power: this.targetFlightState.power });
    }

    tiltBackward() {
        this.pitchTilt -= this.TILT_INC;
        this.targetFlightState = convertors.CommandToFlightStatus({ x: this.rollTilt, y: this.pitchTilt, heading: this.heading, power: this.targetFlightState.power });
    }

    tiltRight() {
        this.rollTilt += this.TILT_INC;
        this.targetFlightState = convertors.CommandToFlightStatus({ x: this.rollTilt, y: this.pitchTilt, heading: this.heading, power: this.targetFlightState.power });
    }

    tiltLeft() {
        this.rollTilt -= this.TILT_INC;
        this.targetFlightState = convertors.CommandToFlightStatus({ x: this.rollTilt, y: this.pitchTilt, heading: this.heading, power: this.targetFlightState.power });
    }

    turnRight() {
        this.heading += this.TILT_INC;
        this.targetFlightState = convertors.CommandToFlightStatus({ x: this.rollTilt, y: this.pitchTilt, heading: this.heading, power: this.targetFlightState.power });
    }

    turnLeft() {
        this.heading -= this.TILT_INC;
        this.targetFlightState = convertors.CommandToFlightStatus({ x: this.rollTilt, y: this.pitchTilt, heading: this.heading, power: this.targetFlightState.power });
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
        this.heading = this.actualFlightState.yaw;
        this.targetFlightState.yaw = this.actualFlightState.yaw;
    }

    initHeading() {
        if (this.heading == -1000) {
            this.resetYaw();
        }
    }

    applyIncomingCommand(cmdJson: string) {
        try{
            const cmd = JSON.parse(cmdJson);
            const x = cmd.x != undefined ? cmd.x : this.command.x;
            const y = cmd.y != undefined ? cmd.y : this.command.y;
            const heading = cmd.heading != undefined ? cmd.heading : this.command.heading;
            const power = cmd.p != undefined ? cmd.p : this.command.power;
            this.command = new Command(heading, x, y, power);
            this.targetFlightState = convertors.JsonToCommand(this.command, this.targetFlightState);
        } catch(err){
        }
    }

    incPower() {
        this.initHeading();
        if (this.targetFlightState.power >= this.config.maxPower) {
            return;
        }
        var newPower = 0;
        if (this.targetFlightState.power >= this.config.minPower) {
            newPower = this.targetFlightState.power + this.POWER_INC;
        } else {
            newPower = this.config.minPower;
        }
        this.applyCommand(new Command(this.targetFlightState.yaw, this.targetFlightState.roll, this.targetFlightState.pitch, newPower));
    }

    decPower() {
        var newPower = 0;
        if (this.targetFlightState.power > this.config.minPower) {
            newPower = this.targetFlightState.power - this.POWER_INC;
        }
        this.applyCommand(new Command(this.targetFlightState.yaw, this.targetFlightState.roll, this.targetFlightState.pitch, newPower));
    }

    applyCommand(command: Command) {
        this.targetFlightState = convertors.CommandToFlightStatus(command);
    }

    applyImuData(rawImuData: ImuData) {
        this.imuData = {
            roll: rawImuData.roll,
            pitch: rawImuData.pitch,
            yaw: rawImuData.yaw,
            time: rawImuData.time
        };
        this.actualFlightState = convertors.ImuDataToFlightStatus(this.imuData);
        if (isNaN(this.targetFlightState.yaw)) {
            this.targetFlightState = new FlightState(0, 0, this.actualFlightState.yaw, 0, 0);
        }
    }

    calcPairPower(power: number, pid: IPIDValue): IArmPower {
        return RpmArmPower(power, pid, this.config.rpm);
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