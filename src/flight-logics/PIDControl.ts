import { torqueCalculator } from './torqueCalculator';
import ICalculatedPowers from '../models/ICalculatedPowers';
import IFlightStateError from '../models/IFlightStateError';

export default class PIDControl {
    constructor(private readonly config: any) {
    }

    P(basePower: number, errors: IFlightStateError): ICalculatedPowers {
        const  r = torqueCalculator(basePower > 0 ? basePower : 1, 
            errors.rollError* this.config.gain * this.config.rollPolarity,
            errors.pitchError* this.config.gain * this.config.pitchPolarity,
            errors.yawError* this.config.gain * this.config.yawPolarity);
        return r;
    }

    PID(basePower: number, errors: IFlightStateError): ICalculatedPowers {
        return this.P(basePower, errors);
    }

}