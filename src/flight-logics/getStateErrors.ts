import FlightState from '../models/FlightState';
import IFlightStateError from '../models/IFlightStateError';
import IFlightConfig from '../models/IFlightConfig';

export function normaliseYawError(actualYaw: number, targetYaw: number) {
    const error = targetYaw - actualYaw;
    if (Math.abs(error) <= 180 ) {
        return error;
    }
    return (360 - Math.abs(error)) * -Math.sign(error);
}

export default function getStateError(target: FlightState, actual: FlightState, config: IFlightConfig): IFlightStateError {
    const rollError = (target.roll - actual.roll);
    const pitchError = (target.pitch - actual.pitch);
    const yawError = normaliseYawError(target.yaw, actual.yaw);
    
    let error = {
        rollError,
        pitchError,
        yawError,
        time: actual.time
    };
    return error;
}