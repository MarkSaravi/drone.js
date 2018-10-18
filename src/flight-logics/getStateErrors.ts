import FlightState from '../models/FlightState';
import IFlightStateError from '../models/IFlightStateError';
import IFlightConfig from '../models/IFlightConfig';

const maxAngle = (x: number, max: number) => {
    if (Math.abs(x) <= max) return x;
    return max * Math.sign(x);
}

export default function getStateError(target: FlightState, actual: FlightState, config: IFlightConfig): IFlightStateError {
    const rollError = (target.roll - actual.roll);
    const pitchError = (target.pitch - actual.pitch);
    const yawError = (target.yaw - actual.yaw);
    let error = {
        rollError: maxAngle(rollError, config.rollPitchPID.maxAngle),
        pitchError: maxAngle(pitchError, config.rollPitchPID.maxAngle),
        yawError,
        time: actual.time
    };
    return error;
}