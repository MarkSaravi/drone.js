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
    private escCommand: string;
    private powers: IPowers;
    private prevTime: number;
    private dataLog: string = null;

    constructor(private config: IFlightConfig) {
        this.pidControl = new PIDController(this.config);
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
        // const s = this.actualFlightState;
        // const text = `${s.roll}\t${s.pitch}\t${s.yaw}\t`;
        // console.log(text);
    }

    createEscCommand(p: IPowers): string {
        return `{"a":${(p.p1).toFixed(3)},"b":${(p.p2).toFixed(3)},"c":${(p.p3).toFixed(3)},"d":${(p.p4).toFixed(3)}}`;
    }

    showState(powers: IPowers, errors: IFlightStateError, basePower: number) {
        const ps = `a: ${(powers.p1).toFixed(3)} ,b: ${(powers.p2).toFixed(3)} ,c: ${(powers.p3).toFixed(3)} ,d: ${(powers.p4).toFixed(3)}`;
        const fss = `roll error: ${(errors.rollError).toFixed(3)}, pitch error: ${(errors.pitchError).toFixed(3)}`;
        const pids = `P: ${(this.config.pGain).toFixed(3)}, I: ${(this.config.iGain).toFixed(3)}, D: ${(this.config.dGain).toFixed(3)}`
        const bps = `Base Power: ${basePower}`;
        const text = `${ps}\t${fss}\t${pids}\t${bps}, ${errors.time}, ${errors.time - this.prevTime}`;
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
        if (basePower >= 0) {
            const controlTorque = this.pidControl.PID(stateError, this.config);
            const baseAangularVelocity = flightLogics.powerToAngularVelocity(basePower, this.config.mRpm, this.config.bRpm);
            const rotorsSpeeds = flightLogics.rotorSpeedCacculator(baseAangularVelocity, controlTorque.rollTorque, controlTorque.pitchTorque, controlTorque.yawTorque);
            this.powers = {
                p1: flightLogics.isPositveNumber(flightLogics.angularVelocityToPower(rotorsSpeeds.wa, this.config.mRpm, this.config.bRpm)),
                p2: flightLogics.isPositveNumber(flightLogics.angularVelocityToPower(rotorsSpeeds.wb, this.config.mRpm, this.config.bRpm)),
                p3: flightLogics.isPositveNumber(flightLogics.angularVelocityToPower(rotorsSpeeds.wc, this.config.mRpm, this.config.bRpm)),
                p4: flightLogics.isPositveNumber(flightLogics.angularVelocityToPower(rotorsSpeeds.wd, this.config.mRpm, this.config.bRpm)),
            }
        } else {
            this.powers = { p1: 0, p2: 0, p3: 0, p4: 0 };
        }
        this.escCommand = this.createEscCommand(this.powers);
        this.showState(this.powers, stateError, basePower);
        return this.escCommand
    }
}