import FlightState from '../models/FlightState';
import IFlightStateError from '../models/IFlightStateError';
import IFlightConfig from '../models/IFlightConfig';

export default function getStateError(target: FlightState, actual: FlightState, config: IFlightConfig): IFlightStateError {
    const rollError = (target.roll - actual.roll);
    const pitchError = (target.pitch - actual.pitch);
    const yawError = (target.yaw - actual.yaw);
    let error = {
        rollError: rollError,
        pitchError: pitchError,
        yawError: yawError,
        time: actual.time
    };
    return error;
}