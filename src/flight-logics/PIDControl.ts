import calcTorques from './calcTorques';
import IPowerCompensations from '../models/IPowerCompensations';
import IFlightStateError from '../models/IFlightStateError';

export default class PIDControl {
    constructor(private readonly config: any) {
    }

    P(basePower: number, errors: IFlightStateError): IPowerCompensations {
        const  r = calcTorques(basePower > 0 ? basePower : 1, 
            errors.rollError* this.config.gain * this.config.rollPolarity,
            errors.pitchError* this.config.gain * this.config.pitchPolarity,
            errors.yawError* this.config.gain * this.config.yawPolarity);
        return r;
    }
}