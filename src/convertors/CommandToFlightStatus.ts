import FlightState from '../models/FlightState';
import Command from '../models/Command';

function CommandToFlightStatus(command: Command, curr: FlightState): FlightState {
    return new FlightState(curr.roll, curr.pitch, curr.yaw, command.power);
}
export default CommandToFlightStatus;