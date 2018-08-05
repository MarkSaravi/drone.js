import FlightState from '../models/FlightState';

export default function applyTargetPower(actual: FlightState, target: FlightState): FlightState {
    return new FlightState(actual.roll, actual.pitch, actual.yaw, target.power);
}
