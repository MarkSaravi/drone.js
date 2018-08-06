import FlightState from '../models/FlightState';
import IFlightStateError from '../models/IFlightStateError';

export default function getStateError(target:FlightState, actual: FlightState): IFlightStateError {
    return {
        rollError: target.roll - actual.roll,
        pitchError: target.pitch - actual.pitch,
        yawError: target.yaw - actual.yaw,
        powerError: target.power - actual.power,
        altitudeError: 0
    };
}