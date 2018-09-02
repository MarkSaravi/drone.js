import FlightState from '../models/FlightState';
import IFlightStateError from '../models/IFlightStateError';

export default function getStateError(target: FlightState, actual: FlightState, config: any): IFlightStateError {
    let error = {
        rollError: (target.roll - actual.roll) * config.rollPolarity,
        pitchError: (target.pitch - actual.pitch) * config.pitchPolarity,
        yawError: (target.yaw - actual.yaw) * config.yawPolarity,
        powerError: target.power - actual.power,
        dt: actual.dt,
        altitudeError: 0
    };
    //console.log(`State Error: ${error.rollError}, ${error.pitchError}, ${error.yawError}`)
    return error;
}