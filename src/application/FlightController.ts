import FlightState from '../models/FlightState';
import Command from '../models/Command';
import ImuData from '../models/ImuData';
import IFlightStateError from '../models/IFlightStateError';
import * as convertors from '../convertors';
import * as flightLogics from '../flight-logics';
import { PIDControl } from '../flight-logics';
import IPowers from '../models/IPowers';
import IFlightConfig from '../models/IFlightConfig';


export default class FlightController {
    private actualFlightState: FlightState;
    private targetFlightState: FlightState;
    private config: IFlightConfig;
    private readonly pidControl: PIDControl;
    private escCommand: string;
    private powers: IPowers;
    private prevTime: number;

    constructor() {
        this.config = require('config.json')('./config.flight.json');
        console.log(`Gain: ${this.config.gain}`);
        this.pidControl = new PIDControl();
        this.actualFlightState = new FlightState(0, 0, 0, 0, 0);
        this.targetFlightState = new FlightState(0, 0, 0, 0, 0);
        this.prevTime = 0;
        this.powers = {
            p1: 0, p2: 0, p3: 0, p4: 0
        };
        this.escCommand = this.createEscCommand({ p1: 0, p2: 0, p3: 0, p4: 0 });
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

    incPower() {
        if (this.targetFlightState.power < 65) {
            this.applyCommand(new Command(0, 0, 0, this.targetFlightState.power + 1));
        }
        if (this.targetFlightState.power > 0 && this.targetFlightState.power <= 1) {
            this.applyCommand(new Command(0, 0, 0, 10));
        }
    }

    decPower() {
        if (this.targetFlightState.power > 0) {
            this.applyCommand(new Command(0, 0, 0, this.targetFlightState.power - 1));
        }
        if (this.targetFlightState.power < 10) {
            this.applyCommand(new Command(0, 0, 0, 0));
        }
    }

    applyCommand(command: Command) {
        this.targetFlightState = convertors.CommandToFlightStatus(command);
    }

    applyImuData(imuData: ImuData) {
        this.actualFlightState = convertors.ImuDataToFlightStatus(imuData);
    }

    createEscCommand(p: IPowers): string {
        return `{"a":${(p.p1).toFixed(3)},"b":${(p.p2).toFixed(3)},"c":${(p.p3).toFixed(3)},"d":${(p.p4).toFixed(3)}}`;
    }

    showState(powers: IPowers, errors: IFlightStateError, basePower: number) {
        const ps = `a: ${(powers.p1).toFixed(3)} ,b: ${(powers.p2).toFixed(3)} ,c: ${(powers.p3).toFixed(3)} ,d: ${(powers.p4).toFixed(3)}`;
        const fss = `roll: ${(errors.rollError).toFixed(3)}, pitch: ${(errors.pitchError).toFixed(3)}`;
        const pids = `P: ${(this.config.pGain).toFixed(3)}, I: ${(this.config.iGain).toFixed(3)}, D: ${(this.config.dGain).toFixed(3)}`
        const bps = `Base Power: ${basePower}`;
        const text = `${ps}\t${fss}\t${pids}\t${bps}, ${errors.time}, ${errors.time - this.prevTime}`;
        this.prevTime = errors.time;

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
        if (basePower >= 10) {
            const baseAangularVelocity = flightLogics.powerToAngularVelocity(basePower, this.config.mRpm, this.config.bRpm);
            const controlTorque = this.pidControl.PID(stateError, this.config);
            const adv = flightLogics.powerCalculator(baseAangularVelocity, controlTorque.rollTorque, controlTorque.pitchTorque, controlTorque.yawTorque);
            const nav = {
                p1: baseAangularVelocity + adv.p1,
                p2: baseAangularVelocity + adv.p2,
                p3: baseAangularVelocity + adv.p3,
                p4: baseAangularVelocity + adv.p4,
            }
            this.powers = {
                p1: flightLogics.angularVelocityToPower(nav.p1, this.config.mRpm, this.config.bRpm),
                p2: flightLogics.angularVelocityToPower(nav.p2, this.config.mRpm, this.config.bRpm),
                p3: flightLogics.angularVelocityToPower(nav.p3, this.config.mRpm, this.config.bRpm),
                p4: flightLogics.angularVelocityToPower(nav.p4, this.config.mRpm, this.config.bRpm),
            }
        } else {
            this.powers = { p1: 0, p2: 0, p3: 0, p4: 0 };
        }
        this.escCommand = this.createEscCommand(this.powers);
        this.showState(this.powers, stateError, basePower);
        return this.escCommand
    }
}