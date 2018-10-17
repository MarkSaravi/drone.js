import FlightState from '../models/FlightState';
import Command from '../models/Command';
import ImuData from '../models/ImuData';
import IFlightStateError from '../models/IFlightStateError';
import * as convertors from '../convertors';
import * as flightLogics from '../flight-logics';
import { PIDController } from '../flight-logics';
import IPowers from '../models/IPowers';
import IFlightConfig from '../models/IFlightConfig';
import fileSyatem from 'fs';


export default class FlightController {
    private actualFlightState: FlightState;
    private targetFlightState: FlightState;
    private readonly pidControl: PIDController;
    private imuDataPerSecond: number;
    private imuTimerStart: number;
    private escCommand: string;
    private powers: IPowers;
    private dataLog: string = null;
    private imuData: ImuData = null;
    private pitchTilt: number = 0;
    private rollTilt: number = 0;
    private readonly TILT_INC: number = 0.25;
    private readonly POWER_START: number = 40;
    private readonly POWER_MAX: number = 55;

    constructor(private config: IFlightConfig) {
        this.pidControl = new PIDController(this.config);
        this.imuDataPerSecond = 0;
        this.imuTimerStart = Date.now();
        this.actualFlightState = new FlightState(0, 0, 0, 0, 0);
        this.targetFlightState = new FlightState(0, 0, 0, 0, 0);
        this.powers = {
            p1: 0, p2: 0, p3: 0, p4: 0
        };
        this.escCommand = this.createEscCommand({ p1: 0, p2: 0, p3: 0, p4: 0 });
        if (this.config.saveData) {
            this.dataLog = `/home/pi/drone.js/logs/${Date.now()}.flight.log`;
        }
    }

    tiltForward() {
        this.pitchTilt += this.TILT_INC;
        this.targetFlightState = convertors.CommandToFlightStatus({x: this.rollTilt, y: this.pitchTilt, heading: 0,power: this.targetFlightState.power });
    }

    tiltBackward() {
        this.pitchTilt -= this.TILT_INC;
        this.targetFlightState = convertors.CommandToFlightStatus({x: this.rollTilt, y: this.pitchTilt, heading: 0,power: this.targetFlightState.power });
    }

    tiltRight() {
        this.rollTilt += this.TILT_INC;
        this.targetFlightState = convertors.CommandToFlightStatus({x: this.rollTilt, y: this.pitchTilt, heading: 0,power: this.targetFlightState.power });
    }

    tiltLeft() {
        this.rollTilt -= this.TILT_INC;
        this.targetFlightState = convertors.CommandToFlightStatus({x: this.rollTilt, y: this.pitchTilt, heading: 0,power: this.targetFlightState.power });
    }

    toggleP() {
        this.config.usePGain = !this.config.usePGain;
        console.log(`P is ${this.config.usePGain ? 'on': 'off'}`);
    }

    toggleI() {
        this.config.useIGain = !this.config.useIGain;
        console.log(`I is ${this.config.useIGain ? 'on': 'off'}`);
    }

    toggleD() {
        this.config.useDGain = !this.config.useDGain;
        console.log(`D is ${this.config.useDGain ? 'on': 'off'}`);
    }

    incPGain() {
        this.config.pGain = this.config.pGain + this.config.pGainInc;
    }

    decPGain() {
        this.config.pGain = this.config.pGain - this.config.pGainInc;
    }

    incGain() {
        this.config.gain = this.config.gain + 1;
    }

    decGain() {
        this.config.gain = this.config.gain - 1;
    }

    incIGain() {
        this.config.iGain = this.config.iGain + this.config.iGainInc;
    }

    decIGain() {
        this.config.iGain = this.config.iGain - this.config.iGainInc;
    }

    incDGain() {
        this.config.dGain = this.config.dGain + this.config.dGainInc;
    }

    decDGain() {
        this.config.dGain = this.config.dGain - this.config.dGainInc;
    }

    markStart() {
        if (this.dataLog) {
            fileSyatem.appendFileSync(this.dataLog, 'start --------------------------------------------------------------\n');
        }
    }

    markEnd() {
        if (this.dataLog) {
            fileSyatem.appendFileSync(this.dataLog, 'end ---------------------------------------------------------------\n');
        }
    }

    incPower() {
        if (this.targetFlightState.power >= this.POWER_MAX) {
            return;
        }
        if (this.targetFlightState.power < this.POWER_MAX && this.targetFlightState.power >= this.POWER_START) {
            this.applyCommand(new Command(0, this.targetFlightState.roll, this.targetFlightState.pitch, this.targetFlightState.power + 0.25));
        } else {
            this.applyCommand(new Command(0, this.targetFlightState.roll, this.targetFlightState.pitch, this.POWER_START));
        } 
    }

    decPower() {
        if (this.targetFlightState.power > this.POWER_START) {
            this.applyCommand(new Command(0, this.targetFlightState.roll, this.targetFlightState.pitch, this.targetFlightState.power - 0.25));
        } else {
            this.applyCommand(new Command(0, this.targetFlightState.roll, this.targetFlightState.pitch, 0));
        }
    }

    applyCommand(command: Command) {
        this.targetFlightState = convertors.CommandToFlightStatus(command);
    }

    noiseRemover(value: number): number {
        // return Math.round(value * 10) / 10;
        return value;
    }

    applyImuData(rawImuData: ImuData) {
        this.imuData = {
            roll: this.noiseRemover(rawImuData.roll),
            pitch: this.noiseRemover(rawImuData.pitch),
            yaw: this.noiseRemover(rawImuData.yaw),
            time: rawImuData.time
        };
        this.actualFlightState = convertors.ImuDataToFlightStatus(this.imuData);
        this.imuDataPerSecond++;
        if (Date.now() - this.imuTimerStart >= 1000) {
            console.log(`IMU Data Per Second: ${this.imuDataPerSecond}`);
            this.imuTimerStart = Date.now();
            this.imuDataPerSecond = 0;
        }
    }

    createEscCommand(p: IPowers): string {
        return `{"a":${(p.p1).toFixed(3)},"b":${(p.p2).toFixed(3)},"c":${(p.p3).toFixed(3)},"d":${(p.p4).toFixed(3)}}`;
    }
    
    signer(x: string): string {
        return x[0] != '-' ? '+' + x : x;
    }

    showState(powers: IPowers, errors: IFlightStateError, basePower: number) {
        const pid = `{${this.config.usePGain?'P':''}${this.config.useIGain?'I':''}${this.config.useDGain?'D':''}}`
        const ps = `b:${(powers.p2).toFixed(2)}, d:${(powers.p4).toFixed(2)}`;
        const fss = `roll:${this.signer((errors.rollError).toFixed(2))}, pitch:${this.signer((errors.pitchError).toFixed(2))}`;
        const pids = `G:${(this.config.gain).toFixed(2)},pG:${(this.config.pGain).toFixed(2)},iG:${(this.config.iGain).toFixed(2)},dG:${(this.config.dGain).toFixed(2)}`
        const bps = `P:${basePower}`;
        const tilts = `${this.targetFlightState.roll},${this.targetFlightState.pitch}`;
        const text = ` ${fss},${pids},${bps},${ps},${pid},${tilts}`;

        if (this.dataLog) {
            fileSyatem.appendFileSync(this.dataLog, text + '\n');
        }
        process.stdout.write(`${text}\n`);
    }

    calcMotorsPower() {
        let stateError: IFlightStateError = flightLogics.getStateError(this.targetFlightState, this.actualFlightState, this.config);
        stateError.yawError = 0;
        const basePower = this.targetFlightState.power;
        this.powers = this.pidControl.PID(basePower, stateError, this.config);
        this.escCommand = this.createEscCommand(this.powers);
        this.showState(this.powers, stateError, basePower);
        return this.escCommand
    }
}