import FlightState from '../models/FlightState';
import Command from '../models/Command';
import ImuData from '../models/ImuData';
import IFlightStateError from '../models/IFlightStateError';
import IPowerCompensations from '../models/IPowerCompensations';
import * as convertors from '../convertors';
import * as services from '../services';
import * as flightLogics from '../flight-logics';
import { PIDControl } from '../flight-logics';


export default class FlightController {
    private actualFlightState: FlightState;
    private targetFlightState: FlightState;
    private config: any;
    imuCounter: number = 0;
    private readonly pidControl: PIDControl;

    constructor() {
        this.config = require('config.json')('./config.flight.json');
        console.log(`Gain: ${this.config.gain}`);
        this.pidControl = new PIDControl(this.config);
        this.actualFlightState = new FlightState(0, 0, 0, 0);
        this.targetFlightState = new FlightState(0, 0, 0, 0);
    }

    applyCommand(command: Command) {
        this.targetFlightState = convertors.CommandToFlightStatus(command, this.targetFlightState);
        services.printFlightState(this.targetFlightState, 'Target: ');
    }

    applyImuData(imuData: ImuData) {
        this.actualFlightState = convertors.ImuDataToFlightStatus(imuData, this.actualFlightState);
        if (this.imuCounter++ >= 100) {
            // console.log("==========================================");
            services.printFlightState(this.actualFlightState, 'Actual: ');
           this.imuCounter = 0;
        }
    }

    calcMotorsPower() {
        this.actualFlightState = flightLogics.applyTargetPower(this.actualFlightState, this.targetFlightState);
        let stateError: IFlightStateError = flightLogics.getStateError(this.targetFlightState, this.actualFlightState);
        const dp = this.pidControl.P(this.actualFlightState.power ,stateError);
        return `a${(dp.p1).toFixed(3)}b${(dp.p2).toFixed(3)}c${(dp.p3).toFixed(3)}d${(dp.p4).toFixed(3)}\n`
    }
}