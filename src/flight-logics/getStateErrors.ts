import FlightState from '../models/FlightState';
import IFlightStateError from '../models/IFlightStateError';

export default function getStateError(target:FlightState, actual: FlightState): IFlightStateError {
    let error = {
        rollError: target.roll - actual.roll,
        pitchError: target.pitch - actual.pitch,
        yawError: target.yaw - actual.yaw,
        powerError: target.power - actual.power,
        dt: actual.dt,
        altitudeError: 0
    };
    //console.log(`State Error: ${error.rollError}, ${error.pitchError}, ${error.yawError}`)
    return error;
}