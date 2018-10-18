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
    private heading: number = -1000;
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

    incGain() {
        this.config.rollPitchPID.gain += this.config.rollPitchPID.gainInc;
    }

    decGain() {
        this.config.rollPitchPID.gain -= this.config.rollPitchPID.gainInc;
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
        const pid = `{${this.config.rollPitchPID.usePGain?'P':''}${this.config.rollPitchPID.useIGain?'I':''}${this.config.rollPitchPID.useDGain?'D':''}}`
        const ps = `b:${(powers.p2).toFixed(2)}, d:${(powers.p4).toFixed(2)}`;
        const fss = `roll:${this.signer((errors.rollError).toFixed(2))}, pitch:${this.signer((errors.pitchError).toFixed(2))}, yaw:${this.signer((errors.yawError).toFixed(2))}`;
        const pids = `G:${(this.config.rollPitchPID.gain).toFixed(2)},pG:${(this.config.rollPitchPID.pGain).toFixed(2)},iG:${(this.config.rollPitchPID.iGain).toFixed(2)},dG:${(this.config.rollPitchPID.dGain).toFixed(2)}`
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
        const basePower = this.targetFlightState.power;
        this.powers = this.pidControl.PID(basePower, stateError, this.config);
        this.escCommand = this.createEscCommand(this.powers);
        this.showState(this.powers, stateError, basePower);
        return this.escCommand
    }
}