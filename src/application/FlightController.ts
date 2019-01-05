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


export default class FlightController {
    private actualFlightState: FlightState;
    private targetFlightState: FlightState;
    private imuData: ImuData = null;
    private pitchTilt: number = 0;
    private rollTilt: number = 0;
    private heading: number = -1000;
    private readonly TILT_INC: number = 0.25;
    private readonly pidRoll: PIDControl = new PIDControl("roll");
    private readonly pidPitch: PIDControl = new PIDControl("roll");
    private readonly pidYaw: PIDControl = new PIDControl("roll");

    constructor(private config: IFlightConfig) {
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

    toggleP() {
        if (this.config.debug == 'roll-pitch') {
            this.config.rollPitchPID.usePGain = !this.config.rollPitchPID.usePGain;
        }
        if (this.config.debug == 'yaw') {
            this.config.yawPID.usePGain = !this.config.yawPID.usePGain;
        }
    }

    toggleI() {
        if (this.config.debug == 'roll-pitch') {
            this.config.rollPitchPID.useIGain = !this.config.rollPitchPID.useIGain;
        }
        if (this.config.debug == 'yaw') {
            this.config.yawPID.useIGain = !this.config.yawPID.useIGain;
        }
    }

    toggleD() {
        if (this.config.debug == 'roll-pitch') {
            this.config.rollPitchPID.useDGain = !this.config.rollPitchPID.useDGain;
        }
        if (this.config.debug == 'yaw') {
            this.config.yawPID.useDGain = !this.config.yawPID.useDGain;
        }
    }

    incPGain() {
        if (this.config.debug == 'roll-pitch') {
            this.config.rollPitchPID.pGain += this.config.rollPitchPID.pGainInc;
        }
        if (this.config.debug == 'yaw') {
            this.config.yawPID.pGain += this.config.yawPID.pGainInc;
        }
    }

    decPGain() {
        if (this.config.debug == 'roll-pitch') {
            this.config.rollPitchPID.pGain -= this.config.rollPitchPID.pGainInc;
        }
        if (this.config.debug == 'yaw') {
            this.config.yawPID.pGain -= this.config.yawPID.pGainInc;
        }
    }

    incIGain() {
        if (this.config.debug == 'roll-pitch') {
            this.config.rollPitchPID.iGain += this.config.rollPitchPID.iGainInc;
        }
        if (this.config.debug == 'yaw') {
            this.config.yawPID.iGain += this.config.yawPID.iGainInc;
        }
    }

    decIGain() {
        if (this.config.debug == 'roll-pitch') {
            this.config.rollPitchPID.iGain -= this.config.rollPitchPID.iGainInc;
        }
        if (this.config.debug == 'yaw') {
            this.config.yawPID.iGain -= this.config.yawPID.iGainInc;
        }
    }

    incDGain() {
        if (this.config.debug == 'roll-pitch') {
            this.config.rollPitchPID.dGain += this.config.rollPitchPID.dGainInc;
        }
        if (this.config.debug == 'yaw') {
            this.config.yawPID.dGain += this.config.yawPID.dGainInc;
        }
    }

    decDGain() {
        if (this.config.debug == 'roll-pitch') {
            this.config.rollPitchPID.dGain -= this.config.rollPitchPID.dGainInc;
        }
        if (this.config.debug == 'yaw') {
            this.config.yawPID.dGain -= this.config.yawPID.dGainInc;
        }
    }

    initHeading() {
        if (this.heading == -1000) {
            this.heading = this.actualFlightState.yaw;
        }
    }

    applyIncomingCommand(cmdJson: string) {
        this.targetFlightState = convertors.JsonToCommand(cmdJson, this.targetFlightState);
    }

    incPower() {
        this.initHeading();
        if (this.targetFlightState.power >= this.config.maxPower) {
            return;
        }
        var newPower = 0;
        if (this.targetFlightState.power >= this.config.minPower) {
            newPower = this.targetFlightState.power + 0.25;
        } else {
            newPower = this.config.minPower;
        }
        this.applyCommand(new Command(this.targetFlightState.yaw, this.targetFlightState.roll, this.targetFlightState.pitch, newPower));
    }

    decPower() {
        var newPower = 0;
        if (this.targetFlightState.power > this.config.minPower) {
            newPower=this.targetFlightState.power - 0.25;
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

    calcPairPower(power: number, pid: IPIDValue): {front: number; back: number} {
        return {
            front: power - pid.sum,
            back: power + pid.sum
        }
    }

    calcMotorsPower(): IPowers {
        let errors: IFlightStateError = getStateError(this.targetFlightState, this.actualFlightState, this.config);
        const basePower = this.targetFlightState.power;
        if (basePower >= this.config.minPower) {
            const rollPIDResult = this.pidRoll.PID(errors.rollError, errors.time, this.config.rollPitchPID);
            const pitchPIDResult = this.pidPitch.PID(errors.pitchError, errors.time, this.config.rollPitchPID);
            const yawPIDResult = this.pidYaw.PID(errors.yawError, errors.time, this.config.yawPID);
            const pitchPower = this.calcPairPower(basePower - yawPIDResult.sum, pitchPIDResult);
            const rollPower = this.calcPairPower(basePower + yawPIDResult.sum, rollPIDResult);
            const powers = {
                a: this.config.motors.a ? pitchPower.front : 0,
                b: this.config.motors.b ? rollPower.front : 0,
                c: this.config.motors.c ? pitchPower.back : 0,
                d: this.config.motors.d ? rollPower.back : 0
            };
            showStatus(basePower, this.config, errors, rollPIDResult, pitchPIDResult, yawPIDResult, powers );
            return powers;
        } else {
            showStatus(basePower, this.config, errors, null, null, null, null);
            return { a: 0, b: 0, c: 0, d: 0 };
        }
    }
}