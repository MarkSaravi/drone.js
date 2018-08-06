import FlightState from '../models/FlightState';
import calcTorques from './calcTorques';
import IPowerCompensations from '../models/IPowerCompensations';
import IFlightStateError from '../models/IFlightStateError';

export default class PIDControl {
    constructor(private readonly gain: number) {
    }

    P(basePower: number, errors: IFlightStateError): IPowerCompensations {
        const  r = calcTorques(basePower > 0 ? basePower : 1, 
            errors.rollError* this.gain,
            errors.pitchError* this.gain,
            errors.yawError* this.gain);
        return r;
    }
}