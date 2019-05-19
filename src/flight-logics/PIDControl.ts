import IPIDConfig from '../models/IPIDConfig';
import { IPIDValue } from '../models/IPIDValue';
const colorStdout = require('color-stdout');

export default class PIDControl {
    integralSum: number = 0;
    prevAngle: number = 0;
    prevTime: number = 0;

    constructor(
        protected readonly name: string,
        protected readonly displayData: boolean = false) {
    }

    limitValue(value: number, maxValue: number) {
        return Math.abs(value) <= maxValue ?
            value : maxValue * Math.sign(value);
    }

    P(error: number, config: IPIDConfig): number {
        return this.limitValue(error * config.pGain, config.pMaxValue);
    }

    I(error: number, dt: number, config: IPIDConfig, isMinPower: boolean): number {
        const err = this.limitValue(error, config.iMaxAngle);
        this.integralSum = this.limitValue(this.integralSum + err * dt * config.iGain , config.iMaxValue);
        this.integralSum = !isMinPower ? this.integralSum : 0;
        return this.integralSum;
    }

    D(dAngle: number, dt: number, config: IPIDConfig): number {
        return this.limitValue(dAngle / dt * config.dGain, config.dMaxValue);
    }

    PID(error: number, angle: number, time: number, config: IPIDConfig, isMinPower: boolean): IPIDValue {
        const dt = (time - this.prevTime);
        const dAngle = this.prevAngle - angle;

        const d = this.D(dAngle, dt, config);
        const p = this.P(error, config);
        const i = this.I(error, dt, config, isMinPower);

        this.prevTime = time;
        this.prevAngle = angle;
        const sum = (config.usePGain ? p : 0) + (config.useIGain ? i : 0) + (config.useDGain ? d : 0);
        return {
            sum: this.limitValue(sum, config.maxOutput),
            p, i, d
        };
    }

}