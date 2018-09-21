import IFlightConfig from '../models/IFlightConfig';

const PERV_ERROR_EMPTY = -999999;

export default class PIDControl {
    integralSum: number = 0;
    prevError: number = PERV_ERROR_EMPTY;
    prevTime: number;

    constructor(private config: IFlightConfig) {
    }

    P(error: number): number {
        return error;
    }

    I(error: number, dt: number, ): number {
        this.integralSum  += error * dt;
        const sign = Math.sign(this.integralSum);
        if (Math.abs(this.integralSum) > this.config.iMax) {
            this.integralSum = this.config.iMax * sign;
        }
        return this.integralSum;
    }

    D(dError: number, dt: number): number {
        return dError / dt;
    }

    PID(error: number, time: number, pGain: number, iGain: number, dGain: number): number {
        if (this.prevError == PERV_ERROR_EMPTY) {
            this.prevError = error;
            this.prevTime = time - 25;
        }
        const dt = (time - this.prevTime) / 1000; //convert to milliseconds
        const dError = error - this.prevError;
        this.prevTime = time;
        this.prevError = error;
        
        const p = this.config.usePGain ? this.P(error) * pGain : 0;
        const i = this.config.useIGain ? this.I(error, dt) * iGain : 0;
        const d = this.config.useDGain ? this.D(dError, dt) * dGain : 0;
        return p + i + d;
    }

}