import FlightState from '../models/FlightState';
import calcTorques from './calcTorques';
import IPowerCompensations from '../models/IPowerCompensations';

export default class PIDControl {
    constructor(private readonly gain: number) {
    }

    P(state: FlightState): IPowerCompensations {
        const  r = calcTorques(state.power, 
            state.roll* this.gain,
            state.pitch* this.gain,
            state.yaw* this.gain);
        return r;
    }
}