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
            p1: 0, p2: 0, p3: 0, p4:0
        };
        this.escCommand = this.createEscCommand({p1:0, p2:0, p3:0, p4:0});
    }

    incGain() {
        this.config.gain = this.config.gain + 0.1;
        console.log(`Gain: ${this.config.gain}`);
    }

    decGain() {
        this.config.gain = this.config.gain - 0.1;
        console.log(`Gain: ${this.config.gain}`);
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

    showState(angularVelocity: number, pv: ICalculatedPowers, fsv: IFlightStateError, msg: string) {
        const ps = `a: ${(pv.p1).toFixed(3)} ,b: ${(pv.p2).toFixed(3)} ,c: ${(pv.p3).toFixed(3)} ,d: ${(pv.p4).toFixed(3)}`;
        const fss = `roll: ${(fsv.rollError).toFixed(3)}, pitch: ${(fsv.pitchError).toFixed(3)} ,yaw${(fsv.yawError).toFixed(3)}`;
        const av = `av: ${(angularVelocity).toFixed(3)}`;
        const text = `av: ${av}, ${ps}, ${fss}, ${msg}`;
        console.clear();
        console.log(text);
    }

    calculatePower(angularVelocity: number, angularVelocityDiff: ICalculatedPowers): ICalculatedPowers {
        const w1 = angularVelocity + angularVelocityDiff.p1;
        const w2 = angularVelocity + angularVelocityDiff.p2;
        const w3 = angularVelocity + angularVelocityDiff.p3;
        const w4 = angularVelocity + angularVelocityDiff.p4;
        const res =  {
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
        const angularVelocity = flightLogics.powerToAngularVelocity(this.actualFlightState.power, this.config.mRpm, this.config.bRpm);
        const angularVelocityDiff = this.pidControl.PID(angularVelocity ,stateError, this.config);
        this.powers = this.calculatePower(angularVelocity, angularVelocityDiff);
        this.showState(angularVelocity, this.powers, stateError, '');
        this.escCommand = this.createEscCommand(this.powers);
        return this.escCommand
    }
}