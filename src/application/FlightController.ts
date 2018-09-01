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
        this.actualFlightState = new FlightState(0, 0, 0, 0);
        this.targetFlightState = new FlightState(0, 0, 0, 0);
        this.powers = {
            p1: 0, p2: 0, p3: 0, p4:0
        };
        this.escCommand = "a0b0c0d0";
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

    isValodPower(p: ICalculatedPowers): boolean
    {
        return (
        !isNaN(p.p1) && p.p1 >= 0 &&
        !isNaN(p.p2) && p.p2 >= 0 &&
        !isNaN(p.p3) && p.p3 >= 0 &&
        !isNaN(p.p4) && p.p4 >= 0);
    }

    createEscCommand(p: ICalculatedPowers): string {
        return `{"a":${(p.p1).toFixed(3)},"b":${(p.p2).toFixed(3)},"c":${(p.p3).toFixed(3)},"d":${(p.p4).toFixed(3)}}`;
    }

    showState(pv: ICalculatedPowers, fsv: IFlightStateError, msg: string) {
        const ps = `a: ${(pv.p1).toFixed(3)} ,b: ${(pv.p2).toFixed(3)} ,c: ${(pv.p3).toFixed(3)} ,d: ${(pv.p4).toFixed(3)}`;
        const fss = `roll: ${(fsv.rollError).toFixed(3)}, pitch: ${(fsv.pitchError).toFixed(3)} ,yaw${(fsv.yawError).toFixed(3)}`;
        const text = `${ps}, ${fss}, ${msg}`;
        console.clear();
        console.log(text);
    }

    calcMotorsPower() {
        this.actualFlightState = flightLogics.applyTargetPower(this.actualFlightState, this.targetFlightState);
        let stateError: IFlightStateError = flightLogics.getStateError(this.targetFlightState, this.actualFlightState);
        stateError.yawError = 0;
        const p = this.pidControl.PID(this.actualFlightState.power ,stateError, this.config);
        if (this.isValodPower(p)) {
            this.powers = p;
            this.showState(this.powers, stateError, '');
        } else {
            this.showState(this.powers, stateError, 'error, using previous values');
        }
        this.escCommand = this.createEscCommand(this.powers);
        return this.escCommand
    }
}