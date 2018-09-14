import FlightState from '../models/FlightState';
import IFlightStateError from '../models/IFlightStateError';

export default function getStateError(target: FlightState, actual: FlightState, config: any): IFlightStateError {
    let error = {
        rollError: (target.roll - actual.roll),
        pitchError: (target.pitch - actual.pitch),
        yawError: (target.yaw - actual.yaw),
        time: actual.time
    };
    return error;
}