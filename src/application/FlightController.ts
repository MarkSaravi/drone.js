import FlightState from '../models/FlightState';
import Command from '../models/Command';
import ImuData from '../models/ImuData';
import IFlightStateError from '../models/IFlightStateError';
import * as convertors from '../convertors';
import * as flightLogics from '../flight-logics';
import { PIDControl } from '../flight-logics';
import ICalculatedPowers from '../models/ICalculatedPowers';


export default class FlightController {
    private actualFlightState: FlightState;
    private targetFlightState: FlightState;
    private config: any;
    private readonly pidControl: PIDControl;
    private escCommand: string;
    private powers: ICalculatedPowers;

    constructor() {
        this.config = require('config.json')('./config.flight.json');
        console.log(`Gain: ${this.config.gain}`);
        this.pidControl = new PIDControl();
        this.actualFlightState = new FlightState(0, 0, 0, 0, 0);
        this.targetFlightState = new FlightState(0, 0, 0, 0, 0);
        this.powers = {
            p1: 0, p2: 0, p3: 0, p4: 0
        };
        this.escCommand = this.createEscCommand({ p1: 0, p2: 0, p3: 0, p4: 0 });
    }

    incPGain() {
        this.config.pGain = this.config.pGain + 0.1;
        console.log(`P Gain: ${this.config.pGain}`);
    }

    decPGain() {
        this.config.pGain = this.config.pGain - 0.1;
        console.log(`P Gain: ${this.config.pGain}`);
    }

    incDGain() {
        this.config.dGain = this.config.dGain + 50;
        console.log(`D Gain: ${this.config.dGain}`);
    }

    decDGain() {
        this.config.dGain = this.config.dGain - 50;
        console.log(`D Gain: ${this.config.dGain}`);
    }

    applyCommand(command: Command) {
        this.targetFlightState = convertors.CommandToFlightStatus(command, this.targetFlightState);
    }

    applyImuData(imuData: ImuData) {
        this.actualFlightState = convertors.ImuDataToFlightStatus(imuData, this.actualFlightState);
    }

    createEscCommand(p: ICalculatedPowers): string {
        return `{"a":${(p.p1).toFixed(3)},"b":${(p.p2).toFixed(3)},"c":${(p.p3).toFixed(3)},"d":${(p.p4).toFixed(3)}}`;
    }

    showState(angularVelocity: number, avd: ICalculatedPowers, pv: ICalculatedPowers, fsv: IFlightStateError, msg: string) {
        const ps = `a: ${(pv.p1).toFixed(3)} ,b: ${(pv.p2).toFixed(3)} ,c: ${(pv.p3).toFixed(3)} ,d: ${(pv.p4).toFixed(3)}`;
        const avds = `p1: ${(avd.p1).toFixed(3)} ,p2: ${(avd.p2).toFixed(3)} ,p3: ${(avd.p3).toFixed(3)} ,p4: ${(avd.p4).toFixed(3)}`;
        const fss = `roll: ${(fsv.rollError).toFixed(3)}, pitch: ${(fsv.pitchError).toFixed(3)}`;
        const av = `av: ${(angularVelocity).toFixed(3)}`;
        //const text = `${av}, ${avds}, ${ps}, ${fss}, ${msg}`;
        const text = `${ps}, ${fss}`;
        //console.clear();
        //console.log(text);
    }

    safeAdd(base: number, inc: number) {
        const sign = Math.sign(inc);
        const saftyFactor = 3;
        return base + (Math.abs(inc) < base / saftyFactor ? inc : base / saftyFactor * sign);
    }

    calculatePower(angularVelocity: number, angularVelocityDiff: ICalculatedPowers): ICalculatedPowers {
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
        this.actualFlightState = flightLogics.applyTargetPower(this.actualFlightState, this.targetFlightState);
        let stateError: IFlightStateError = flightLogics.getStateError(this.targetFlightState, this.actualFlightState, this.config);
        stateError.yawError = 0;
        const basePower = this.actualFlightState.power;
        const angularVelocity = flightLogics.powerToAngularVelocity(basePower, this.config.mRpm, this.config.bRpm);
        const angularVelocityDiff = this.pidControl.PID(angularVelocity, stateError, this.config);
        this.powers = this.calculatePower(angularVelocity, angularVelocityDiff);
        this.showState(angularVelocity, angularVelocityDiff, this.powers, stateError, '');
        this.escCommand = this.createEscCommand(this.powers);
        return this.escCommand
    }
}