import FlightState from '../models/FlightState';
import Command from '../models/Command';
import ImuData from '../models/ImuData';
import IFlightStateError from '../models/IFlightStateError';
import * as convertors from '../convertors';
import * as flightLogics from '../flight-logics';
import { PIDController } from '../flight-logics';
import IPowers from '../models/IPowers';
import IFlightConfig from '../models/IFlightConfig';
import ITorqueResponse from '../models/ITorqueResponse';
import fileSyatem from 'fs';


export default class FlightController {
    private actualFlightState: FlightState;
    private targetFlightState: FlightState;
    private readonly pidControl: PIDController;
    private imuDataPerSecond: number;
    private imuTimerStart: number;
    private escCommand: string;
    private powers: IPowers;
    private prevTime: number;
    private dataLog: string = null;

    constructor(private config: IFlightConfig) {
        this.pidControl = new PIDController(this.config);
        this.imuDataPerSecond = 0;
        this.imuTimerStart = Date.now();
        this.actualFlightState = new FlightState(0, 0, 0, 0, 0);
        this.targetFlightState = new FlightState(0, 0, 0, 0, 0);
        this.prevTime = 0;
        this.powers = {
            p1: 0, p2: 0, p3: 0, p4: 0
        };
        this.escCommand = this.createEscCommand({ p1: 0, p2: 0, p3: 0, p4: 0 });
        if (this.config.saveData) {
            this.dataLog = `/home/pi/drone.js/logs/${Date.now()}.flight.log`;
        }
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
        if (this.targetFlightState.power < 65) {
            this.applyCommand(new Command(0, 0, 0, this.targetFlightState.power + 1));
        }
    }

    decPower() {
        if (this.targetFlightState.power > 0) {
            this.applyCommand(new Command(0, 0, 0, this.targetFlightState.power - 1));
        }
    }

    applyCommand(command: Command) {
        this.targetFlightState = convertors.CommandToFlightStatus(command);
    }

    applyImuData(imuData: ImuData) {
        this.actualFlightState = convertors.ImuDataToFlightStatus(imuData);
        this.imuDataPerSecond++;
        // console.log(`roll: ${(imuData.roll).toFixed(3)}, pitch: ${(imuData.pitch).toFixed(3)}, yaw: ${(imuData.yaw).toFixed(3)}, time: ${imuData.time}`);
        if (Date.now() - this.imuTimerStart >= 1000) {
            console.log(`IMU Data Per Second: ${this.imuDataPerSecond}`);
            this.imuTimerStart = Date.now();
            this.imuDataPerSecond = 0;
        }
    }

    createEscCommand(p: IPowers): string {
        return `{"a":${(p.p1).toFixed(3)},"b":${(p.p2).toFixed(3)},"c":${(p.p3).toFixed(3)},"d":${(p.p4).toFixed(3)}}`;
    }

    showState(powers: IPowers, errors: IFlightStateError, basePower: number) {
        const pid = `${this.config.usePGain?'P':''}, ${this.config.useIGain?'I':''}, ${this.config.useDGain?'D':''}`
        const ps = `a: ${(powers.p1).toFixed(3)} ,b: ${(powers.p2).toFixed(3)} ,c: ${(powers.p3).toFixed(3)} ,d: ${(powers.p4).toFixed(3)}`;
        // const trs = controlTorque ? `roll res: ${(controlTorque.rollTorque).toFixed(3)}, pitch res: ${(controlTorque.pitchTorque).toFixed(3)}` : '';
        const fss = `roll error: ${(errors.rollError).toFixed(3)}, pitch error: ${(errors.pitchError).toFixed(3)}`;
        const pids = `P: ${(this.config.pGain).toFixed(3)}, I: ${(this.config.iGain).toFixed(3)}, D: ${(this.config.dGain).toFixed(3)}`
        const bps = `Base Power: ${basePower}`;
        const text = `${ps}\t${fss}\t${pid}\t${pids}\t${bps}\t${errors.time}\t${errors.time - this.prevTime}`;
        this.prevTime = errors.time;
        if (this.dataLog) {
            fileSyatem.appendFileSync(this.dataLog, text + '\n');
        }
        console.log(text);
    }

    safeAdd(base: number, inc: number) {
        return base + inc;
    }

    calculatePower(angularVelocity: number, angularVelocityDiff: IPowers): IPowers {
        const w1 = this.safeAdd(angularVelocity, angularVelocityDiff.p1);
        const w2 = this.safeAdd(angularVelocity, angularVelocityDiff.p2);
        const w3 = this.safeAdd(angularVelocity, angularVelocityDiff.p3);
        const w4 = this.safeAdd(angularVelocity, angularVelocityDiff.p4);
        const res = {
            p1: flightLogics.angularVelocityToPower(w1, this.config.mRpm, this.config.bRpm),
            p2: flightLogics.angularVelocityToPower(w2, this.config.mRpm, this.config.bRpm),
            p3: flightLogics.angularVelocityToPower(w3, this.config.mRpm, this.config.bRpm),
            p4: flightLogics.angularVelocityToPower(w4, this.config.mRpm, this.config.bRpm)
        }
        return res;
    }

    calcMotorsPower() {
        let stateError: IFlightStateError = flightLogics.getStateError(this.targetFlightState, this.actualFlightState, this.config);
        stateError.yawError = 0;
        const basePower = this.targetFlightState.power;
        this.powers = this.pidControl.PID(basePower, stateError, this.config);
        // if (basePower > 0) {
        //     const baseAangularVelocity = flightLogics.powerToAngularVelocity(basePower, this.config.mRpm, this.config.bRpm);
        //     const rotorsSpeeds = flightLogics.rotorSpeedCacculator(baseAangularVelocity, controlTorque.rollTorque, controlTorque.pitchTorque, controlTorque.yawTorque);
        //     this.powers = {
        //         p1: flightLogics.isPositveNumber(flightLogics.angularVelocityToPower(rotorsSpeeds.wa, this.config.mRpm, this.config.bRpm)),
        //         p2: flightLogics.isPositveNumber(flightLogics.angularVelocityToPower(rotorsSpeeds.wb, this.config.mRpm, this.config.bRpm)),
        //         p3: flightLogics.isPositveNumber(flightLogics.angularVelocityToPower(rotorsSpeeds.wc, this.config.mRpm, this.config.bRpm)),
        //         p4: flightLogics.isPositveNumber(flightLogics.angularVelocityToPower(rotorsSpeeds.wd, this.config.mRpm, this.config.bRpm)),
        //     }
        // } else {
        //     this.powers = { p1: 0, p2: 0, p3: 0, p4: 0 };
        // }
        this.escCommand = this.createEscCommand(this.powers);
        if (this.imuDataPerSecond % 10 == 0) {
            this.showState(this.powers, stateError, basePower);
        }
        return this.escCommand
    }
}