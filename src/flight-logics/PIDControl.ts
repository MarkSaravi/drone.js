import FlightState from '../models/FlightState';
import calcTorques from './calcTorques';

export default class PIDControl {
    constructor(private readonly gain: number) {
    }

    P(state: FlightState): [number, number, number, number] {
        const [p1, p2, p3, p4] = calcTorques(state.power, 
            state.roll* this.gain,
            state.pitch* this.gain,
            state.yaw* this.gain);
        return [p1, p2, p3, p4];
    }
}