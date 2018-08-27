import { torqueCalculator } from './torqueCalculator';
import ICalculatedPowers from '../models/ICalculatedPowers';
import IFlightStateError from '../models/IFlightStateError';

export default class PIDControl {
    constructor() {
    }

    P(basePower: number, errors: IFlightStateError, config: any): ICalculatedPowers {
        const  r = torqueCalculator(basePower > 0 ? basePower : 1, 
            errors.rollError* config.gain * config.rollPolarity,
            errors.pitchError* config.gain * config.pitchPolarity,
            errors.yawError* config.gain * config.yawPolarity);
        return r;
    }

    PID(basePower: number, errors: IFlightStateError, config: any): ICalculatedPowers {
        return this.P(basePower, errors, config);
    }

}