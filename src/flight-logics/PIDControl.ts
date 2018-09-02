import torqueCalculator from './torqueCalculator';
import ICalculatedPowers from '../models/ICalculatedPowers';
import IFlightStateError from '../models/IFlightStateError';
import ITorqueResponse from '../models/ITorqueResponse';
import IFlightConfig from '../models/IFlightConfig';

export default class PIDControl {
    prevError: IFlightStateError;
    constructor() {
        this.prevError = null;
    }

    Pxxx(basePower: number, errors: IFlightStateError, config: any): ICalculatedPowers {
        const  r = torqueCalculator(basePower > 0 ? basePower : 1, 
            errors.rollError* config.gain * config.rollPolarity,
            errors.pitchError* config.gain * config.pitchPolarity,
            errors.yawError* config.gain * config.yawPolarity);
        return r;
    }

    P(errors: IFlightStateError, config: IFlightConfig): ITorqueResponse {
        return {
            rollTorque: errors.rollError * config.pGain,
            pitchTorque: errors.pitchError * config.pGain,
            yawTorque: errors.yawError * config.pGain
        }
    }

    I(errors: IFlightStateError, config: IFlightConfig) {
        if (this.prevError==null) {
            this.prevError = errors;
        }
        return {
            
        }
    }

    PID(basePower: number, errors: IFlightStateError, config: any): ICalculatedPowers {
        return this.Pxxx(basePower, errors, config);
    }

}