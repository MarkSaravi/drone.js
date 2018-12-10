import FlightState from '../models/FlightState';
import Command from '../models/Command';
import ImuData from '../models/ImuData';
import IFlightStateError from '../models/IFlightStateError';
import * as convertors from '../convertors';
import * as flightLogics from '../flight-logics';
import { PIDController } from '../flight-logics';
import IPowers from '../models/IPowers';
import IFlightConfig from '../models/IFlightConfig';
import { fixNum } from '../common';


export default class FlightController {
    private actualFlightState: FlightState;
    private targetFlightState: FlightState;
    private readonly pidControl: PIDController;
    private escCommand: string;
    private powers: IPowers;
    private imuData: ImuData = null;
    private pitchTilt: number = 0;
    private rollTilt: number = 0;
    private heading: number = -1000;
    private readonly TILT_INC: number = 0.25;
    private readonly POWER_START: number = 45;
    private readonly POWER_MAX: number = 95;

    constructor(private config: IFlightConfig) {
        this.pidControl = new PIDController();
        this.actualFlightState = new FlightState(0, 0, 0, 0, 0);
        this.targetFlightState = new FlightState(0, 0, 0, 0, 0);
        this.powers = {
            p1: 0, p2: 0, p3: 0, p4: 0
        };
        this.escCommand = this.createEscCommand({ p1: 0, p2: 0, p3: 0, p4: 0 });
    }

    stop(): string {
        console.log('stop *********************************************************************************************');
        this.applyCommand(new Command(this.targetFlightState.yaw, this.targetFlightState.roll, this.targetFlightState.pitch, 0));
        this.powers = { p1: 0, p2: 0, p3: 0, p4: 0 }
        this.escCommand = this.createEscCommand(this.powers);
        return this.escCommand;
    }

    tiltForward() {
        this.pitchTilt += this.TILT_INC;
        this.targetFlightState = convertors.CommandToFlightStatus({x: this.rollTilt, y: this.pitchTilt, heading: this.heading,power: this.targetFlightState.power });
    }

    tiltBackward() {
        this.pitchTilt -= this.TILT_INC;
        this.targetFlightState = convertors.CommandToFlightStatus({x: this.rollTilt, y: this.pitchTilt, heading: this.heading,power: this.targetFlightState.power });
    }

    tiltRight() {
        this.rollTilt += this.TILT_INC;
        this.targetFlightState = convertors.CommandToFlightStatus({x: this.rollTilt, y: this.pitchTilt, heading: this.heading,power: this.targetFlightState.power });
    }

    tiltLeft() {
        this.rollTilt -= this.TILT_INC;
        this.targetFlightState = convertors.CommandToFlightStatus({x: this.rollTilt, y: this.pitchTilt, heading: this.heading,power: this.targetFlightState.power });
    }

    turnRight() {
        this.heading += this.TILT_INC;
        this.targetFlightState = convertors.CommandToFlightStatus({x: this.rollTilt, y: this.pitchTilt, heading: this.heading,power: this.targetFlightState.power });  
    }

    turnLeft() {
        this.heading -= this.TILT_INC;
        this.targetFlightState = convertors.CommandToFlightStatus({x: this.rollTilt, y: this.pitchTilt, heading: this.heading,power: this.targetFlightState.power });
    }

    toggleP() {
        this.config.rollPitchPID.usePGain = !this.config.rollPitchPID.usePGain;
        console.log(`P is ${this.config.rollPitchPID.usePGain ? 'on': 'off'}`);
    }

    toggleI() {
        this.config.rollPitchPID.useIGain = !this.config.rollPitchPID.useIGain;
        console.log(`I is ${this.config.rollPitchPID.useIGain ? 'on': 'off'}`);
    }

    toggleD() {
        this.config.rollPitchPID.useDGain = !this.config.rollPitchPID.useDGain;
        console.log(`D is ${this.config.rollPitchPID.useDGain ? 'on': 'off'}`);
    }

    incPGain() {
        this.config.rollPitchPID.pGain += this.config.rollPitchPID.pGainInc;
    }

    decPGain() {
        this.config.rollPitchPID.pGain -= this.config.rollPitchPID.pGainInc;
    }

    incIGain() {
        this.config.rollPitchPID.iGain += this.config.rollPitchPID.iGainInc;
    }

    decIGain() {
        this.config.rollPitchPID.iGain -= this.config.rollPitchPID.iGainInc;
    }

    incDGain() {
        this.config.rollPitchPID.dGain += this.config.rollPitchPID.dGainInc;
    }

    decDGain() {
        this.config.rollPitchPID.dGain -= this.config.rollPitchPID.dGainInc;
    }

    initHeading() {
        if (this.heading == -1000){
            this.heading = this.actualFlightState.yaw;
        }
    }

    incPower() {
        this.initHeading();
        if (this.targetFlightState.power >= this.POWER_MAX) {
            return;
        }
        if (this.targetFlightState.power < this.POWER_MAX && this.targetFlightState.power >= this.POWER_START) {
            this.applyCommand(new Command(this.targetFlightState.yaw, this.targetFlightState.roll, this.targetFlightState.pitch, this.targetFlightState.power + 0.25));
        } else {
            this.applyCommand(new Command(this.targetFlightState.yaw, this.targetFlightState.roll, this.targetFlightState.pitch, this.POWER_START));
        } 
    }

    decPower() {
        if (this.targetFlightState.power > this.POWER_START) {
            this.applyCommand(new Command(this.targetFlightState.yaw, this.targetFlightState.roll, this.targetFlightState.pitch, this.targetFlightState.power - 0.25));
        } else {
            this.applyCommand(new Command(this.targetFlightState.yaw, this.targetFlightState.roll, this.targetFlightState.pitch, 0));
        }
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
        if (Math.abs( this.actualFlightState.roll)>30 || Math.abs(this.actualFlightState.pitch)>30) {
            this.stop();
        }
    }

    createEscCommand(p: IPowers): string {
        return `{"a":${(p.p1).toFixed(3)},"b":${(p.p2).toFixed(3)},"c":${(p.p3).toFixed(3)},"d":${(p.p4).toFixed(3)}}`;
    }
    
    showStatus(powers: IPowers, errors: IFlightStateError, basePower: number) {
        const ps = `a:${fixNum(powers.p1, 5)} b:${fixNum(powers.p2, 5)} c:${fixNum(powers.p3, 5)} d:${fixNum(powers.p4, 5)}`;
        const fss = `roll:${fixNum(errors.rollError, 6)} pitch:${fixNum(errors.pitchError, 6)} yaw:${fixNum(errors.yawError, 6)}`;
        const pids = `pG:${fixNum(this.config.rollPitchPID.pGain,6)} iG:${fixNum(this.config.rollPitchPID.iGain,6)} dG:${fixNum(this.config.rollPitchPID.dGain,6)}`
        const bps = `power:${basePower}`;
        const text = ` ${fss} ${pids} ${bps} ${ps}`;

        process.stdout.write(`${text}\n`);
    }

    calcMotorsPower() {
        let stateError: IFlightStateError = flightLogics.getStateError(this.targetFlightState, this.actualFlightState, this.config);
        const basePower = this.targetFlightState.power;
        if (this.targetFlightState.power > 39) {
            this.powers = this.pidControl.PID(basePower, stateError, this.config);
        } else {
            this.powers = { p1: 0, p2: 0, p3: 0, p4: 0 }
        }        
        this.escCommand = this.createEscCommand(this.powers);
        this.showStatus(this.powers, stateError, basePower);
        return this.escCommand
    }
}