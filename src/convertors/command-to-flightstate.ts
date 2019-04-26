import { IFlightState } from "../models/FlightState";
import { IRemoteControlConfig } from "../models/IFlightConfig";

const commandToFlightState = (cmdStr: string, flightState: IFlightState, config: IRemoteControlConfig) => {
    const cmd = JSON.parse(cmdStr);
}

export default commandToFlightState;