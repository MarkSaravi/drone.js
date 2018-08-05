import FlightState from '../models/FlightState';

export default class PIDControl {
    constructor(private readonly gain: number) {
    }

    P(state: FlightState): [number, number, number] {
        return [state.roll, state.pitch, state.yaw];
    }
}