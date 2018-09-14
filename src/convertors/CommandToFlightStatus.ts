import FlightState from '../models/FlightState';
import Command from '../models/Command';

function CommandToFlightStatus(command: Command): FlightState {
    return new FlightState(0, 0, 0, 0, command.power);
}
export default CommandToFlightStatus;