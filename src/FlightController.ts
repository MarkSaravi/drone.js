import FlightState from './models/FlightState';
import Command from './models/Command';
import ImuData from './models/ImuData';
import * as convertors from './convertors';
import * as services from './services';
import * as flightLogics from './flight-logics';


export default class FlightController {
    private actualFlightState: FlightState;
    private targetFlightState: FlightState;
    imuCounter: number = 0;

    constructor() {
        this.actualFlightState = new FlightState(0, 0, 0, 0);
        this.targetFlightState = new FlightState(0, 0, 0, 0);
    }

    applyCommand(command: Command) {
        this.targetFlightState = convertors.CommandToFlightStatus(command, this.targetFlightState);
        services.printFlightState(this.targetFlightState,'Target: ');
        this.actualFlightState = flightLogics.applyTargetPower(this.actualFlightState, this.targetFlightState);

    }

    applyImuData(imuData: ImuData) {
        this.actualFlightState = convertors.ImuDataToFlightStatus(imuData, this.actualFlightState);
        if (this.imuCounter++ >= 100) {
            //console.log("==========================================");
            services.printFlightState(this.actualFlightState,'Actual: ');
            this.imuCounter = 0;
        }
    }

    getPower(): number {
        return this.actualFlightState.power;
    }
}