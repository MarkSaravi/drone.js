import FlightState from './models/FlightState';
import Command from './models/Command';
import ImuData from './models/ImuData';
import * as convertors from './convertors';


export default class FlightController {
    private actualFlightState: FlightState;
    private targetFlightState: FlightState;

    constructor() {

    }

    applyCommand(command: Command) {
        this.targetFlightState = convertors.CommandToFlightStatus(command, this.targetFlightState);
    }

    applyImuData(imuData: ImuData) {
        this.actualFlightState = convertors.ImuDataToFlightStatus(imuData, this.actualFlightState);
    }
}