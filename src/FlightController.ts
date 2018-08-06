import FlightState from './models/FlightState';
import Command from './models/Command';
import ImuData from './models/ImuData';
import IFlightStateError from './models/IFlightStateError';
import IPowerCompensations from './models/IPowerCompensations';
import * as convertors from './convertors';
import * as services from './services';
import * as flightLogics from './flight-logics';
import { PIDControl } from './flight-logics';


export default class FlightController {
    private actualFlightState: FlightState;
    private targetFlightState: FlightState;
    private config: any;
    imuCounter: number = 0;
    private readonly pidControl: PIDControl;

    constructor() {
        this.config = require('config.json')('./config.flight.json');
        this.pidControl = new PIDControl(this.config.gain);
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
            //console.log("==========================================");
            services.printFlightState(this.actualFlightState, 'Actual: ');
            this.imuCounter = 0;
        }
    }

    calcMotorsPower() {
        this.actualFlightState = flightLogics.applyTargetPower(this.actualFlightState, this.targetFlightState);
        let stateError: IFlightStateError = flightLogics.getStateError(this.targetFlightState, this.actualFlightState);
        const dp = this.pidControl.P(this.actualFlightState);
        const p = this.actualFlightState.power;
        return `a${(p + dp.p1).toFixed(3)}b${(p + dp.p2).toFixed(3)}c${(p + dp.p3).toFixed(3)}d${(p + dp.p4).toFixed(3)}\n`
    }
}