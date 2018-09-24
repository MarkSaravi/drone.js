import IFlightConfig from '../models/IFlightConfig';

const PERV_ERROR_EMPTY = -999999;

export default class PIDControl {
    integralSum: number = 0;
    prevError: number = PERV_ERROR_EMPTY;
    prevTime: number;

    constructor() {
    }

    P(error: number, config: IFlightConfig): number {
        return error * config.pGain;
    }

    I(error: number, dt: number, config: IFlightConfig): number {
        if (Math.abs(error) < config.iMaxAngle) {
            this.integralSum += error * dt * config.iGain;
        } else {
            this.integralSum = 0;
        }
        return this.integralSum;
    }

    D(dError: number, dt: number, config: IFlightConfig): number {
        return dError / dt * config.dGain;
    }

    PID(error: number, time: number, config: IFlightConfig): number {
        if (this.prevError == PERV_ERROR_EMPTY) {
            this.prevError = error;
            this.prevTime = time - 25;
        }
        const dt = (time - this.prevTime) / 1000; //convert to milliseconds
        const dError = error - this.prevError;
        this.prevTime = time;
        this.prevError = error;

        const p = this.P(error, config);
        const i = this.I(error, dt, config);
        const d = this.D(dError, dt, config);
        return (config.usePGain ? p : 0) + (config.useIGain ? i : 0) + (config.useDGain ? d : 0);
    }

}