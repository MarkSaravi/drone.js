import IPIDConfig from '../models/IPIDConfig';
import { fixNum } from '../common';

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
        return error * config.pGain;
    }

    I(error: number, dt: number, config: IPIDConfig): number {
        if (dt > 0.05) {
            dt = 0
        }
        // reset integral sum if it is opposit to tilt direction
        if (this.integralSum * error < 0 && Math.abs(error) > 3) {
            this.iCounter++;
        } else {
            this.iCounter = 0;
        }
        if (this.iCounter > 10) {
            this.integralSum = 0;
            console.log('reset I -------------------------------------------------------------------------');
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

    showStatus(sum: number, p: number, i: number, d: number, dError: number, t: number, dt: number, config: IPIDConfig) {
        if (!this.displayData) return;
        if (this.name == 'pitch' || this.name == 'role') return;
        const pidname = `(${config.usePGain ? 'P' : '_'}${config.useIGain ? 'I' : '_'}${config.useDGain ? 'D' : '_'})`;
        // const pidname = `${this.name}(${config.usePGain ? 'P' : '_'}${config.useIGain ? 'I' : '_'}${config.useDGain ? 'D' : '_'})`;
        const pids = `${pidname} s:${fixNum(sum)} p:${fixNum(p)} i:${fixNum(i)} d:${fixNum(d)} de:${fixNum(dError)} dt:${fixNum(dt)}`;
        process.stdout.write(pids);
    }

    PID(error: number, time: number, config: IPIDConfig, power: number): number {
        const dt = (time - this.prevTime); //convert to milliseconds
        const dError = error - this.prevError;

        const d = this.D(dError, dt, config);
        const p = this.P(error, config);
        const i = this.I(error, dt, config);

        this.prevTime = time;
        this.prevError = error;
        const sum = (config.usePGain ? p : 0) + (config.useIGain ? i : 0) + (config.useDGain ? d : 0);
        this.showStatus(sum, p, i, d, dError, time, dt, config);
        return sum;
    }

}