import FlightState from '../models/FlightState';
import Command from '../models/Command';

function CommandToFlightStatus(command: Command): FlightState {
    return new FlightState(command.x, command.y, command.heading, 0, command.power);
}
export default CommandToFlightStatus;