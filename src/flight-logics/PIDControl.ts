import IPIDConfig from '../models/IPIDConfig';
import { IPIDValue } from '../models/IPIDValue';

export default class PIDControl {
    integralSum: number = 0;
    prevError: number = 0;
    prevTime: number = 0;
    iCounter: number = 0;

    constructor(
        protected readonly name: string,
        protected readonly displayData: boolean = false) {
    }

    P(error: number, config: IPIDConfig): number {
        const err = Math.abs(error) < config.pMaxAngle ?
            error: Math.sign(error) * config.pMaxAngle;
        return err * config.pGain;
    }

    I(error: number, dt: number, config: IPIDConfig): number {
        if (dt > 0.05) {
            dt = 0
        }
        // reset integral sum if it is opposit to tilt direction
        if (this.integralSum * error < 0 && Math.abs(error) > config.iMaxAngle) {
            this.iCounter++;
        } else {
            this.iCounter = 0;
        }
        if (this.iCounter > 10) {
            this.integralSum = 0;
        }

        this.integralSum += 
            (Math.abs(this.integralSum) > config.iMaxValue && this.integralSum * error > 0) ||
            Math.abs(error) > config.iMaxAngle ||
            Math.abs(error) < config.iMinAngle ? 
            0: error * dt * config.iGain;
        return this.integralSum;
    }

    D(dError: number, dt: number, config: IPIDConfig): number {
        return dError / dt * config.dGain;
    }

    PID(error: number, time: number, config: IPIDConfig): IPIDValue {
        const dt = (time - this.prevTime); //convert to milliseconds
        const dError = error - this.prevError;

        const d = this.D(dError, dt, config);
        const p = this.P(error, config);
        const i = this.I(error, dt, config);

        this.prevTime = time;
        this.prevError = error;
        const sum = (config.usePGain ? p : 0) + (config.useIGain ? i : 0) + (config.useDGain ? d : 0);
        return {
            sum, p,i,d
        };
    }

}