import torqueCalculator from './torqueCalculator';
import ICalculatedPowers from '../models/ICalculatedPowers';
import IFlightStateError from '../models/IFlightStateError';
import ITorqueResponse from '../models/ITorqueResponse';
import IFlightConfig from '../models/IFlightConfig';

export default class PIDControl {
    integralSumRoll: number = 0;
    integralSumPitch: number = 0;
    integralSumYaw: number = 0;
    prevError: IFlightStateError = null;

    constructor() {
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
        if (this.prevError == null) {
            this.prevError = errors;
        }
        const dt = (errors.dt - this.prevError.dt)/1e6;
        this.integralSumRoll += (this.prevError.rollError + errors.rollError) * dt / 2;
        this.integralSumPitch += (this.prevError.pitchError + errors.pitchError) * dt / 2;
        this.integralSumYaw += (this.prevError.yawError + errors.yawError) * dt / 2;
        return {
            rollTorque: this.integralSumRoll * config.iGain,
            pitchTorque: this.integralSumPitch * config.iGain,
            yawTorque: this.integralSumYaw * config.iGain
        }
    }

    PID(basePower: number, errors: IFlightStateError, config: any): ICalculatedPowers {
        return this.Pxxx(basePower, errors, config);
    }

}