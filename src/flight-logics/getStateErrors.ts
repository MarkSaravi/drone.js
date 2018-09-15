import FlightState from '../models/FlightState';
import IFlightStateError from '../models/IFlightStateError';

const maxAngle = (x: number, max: number) => {
    if (Math.abs(x) <= max) return 30;
    return max * Math.sign(x);
}

export default function getStateError(target: FlightState, actual: FlightState, config: any): IFlightStateError {
    const rollError = (target.roll - actual.roll);
    const pitchError = (target.pitch - actual.pitch);
    const yawError = (target.yaw - actual.yaw);
    let error = {
        rollError: maxAngle(rollError, config.maxAngle),
        pitchError: maxAngle(pitchError, config.maxAngle),
        yawError: (target.yaw - actual.yaw),
        time: actual.time
    };
    return error;
}