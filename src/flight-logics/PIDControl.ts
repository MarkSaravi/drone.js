import IFlightConfig from '../models/IFlightConfig';

export default class PIDControl {
    integralSum: number = 0;
    prevError: number = 0;
    prevTime: number = 0;

    constructor() {
    }

    P(error: number, config: IFlightConfig): number {
        return error * config.pGain;
    }

    I(error: number, dt: number, config: IFlightConfig): number {
        if (Math.abs(error) <= config.iMaxAngle) {
            this.integralSum += error * dt / 10 * config.iGain;
        } 
        this.integralSum = Math.abs(this.integralSum) <= config.iMaxValue ? this.integralSum : config.iMaxValue * Math.sign(this.integralSum);
        return this.integralSum;
    }

    D(dError: number, dt: number, config: IFlightConfig): number {
        return dError / dt * config.dGain;
    }

    fixLen(x: string): string {
        let s = x;
        while (s.length < 8) {
            s = ' ' + s;
        }
        if (s.length > 8) {
            s = s.substring(0, 8);
        }
        return s;
    }

    showStatus(sum: number, p: number, i: number, d: number, dError: number, t: number, dt: number) {
        const sums = (sum).toFixed(2);
        const ps = (p).toFixed(2);
        const is = (i).toFixed(2);
        const ds = (d).toFixed(2);
        const pids = `S:${this.fixLen(sums)},P:${this.fixLen(ps)},I:${this.fixLen(is)},D:${this.fixLen(ds)},dE:${this.fixLen(dError.toString())},t:${this.fixLen(t.toString())},dt:${this.fixLen((dt*1000000).toString())},`;
        process.stdout.write(pids);
    }

    PID(error: number, time: number, config: IFlightConfig): number {        
        const dt = (time - this.prevTime) / 10000; //convert to milliseconds
        const dError = error - this.prevError;

        const d = this.D(dError, dt, config);
        const p = this.P(error, config);
        const i = this.I(error, dt, config);

        this.prevTime = time;
        this.prevError = error;        
        const sum = (config.usePGain ? p : 0) + (config.useIGain ? i : 0) + (config.useDGain ? d : 0);
        this.showStatus(sum * config.gain, p, i, d, dError, time, dt);
        return sum;
    }

}