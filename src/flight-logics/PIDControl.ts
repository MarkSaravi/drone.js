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

    P(error: number, config: IPIDConfig): number {
        const err = Math.abs(error) < config.pMaxAngle ?
            error : Math.sign(error) * config.pMaxAngle;
        return err * config.pGain;
    }

    I(error: number, dt: number, config: IPIDConfig): number {
        this.integralSum += Math.abs(error) <= config.iMaxAngle ? error * dt * config.iGain : 0;
        this.integralSum = Math.abs(this.integralSum) <= config.iMaxValue ?
            this.integralSum : config.iMaxValue * Math.sign(this.integralSum);
        return this.integralSum;
    }

    D(dAngle: number, dt: number, config: IPIDConfig): number {
        const d = dAngle / dt * config.dGain;
        return Math.abs(d) < config.dMaxValue ? d : config.dMaxValue * Math.sign(d);
    }

    PID(error: number, angle: number, time: number, config: IPIDConfig): IPIDValue {
        const dt = (time - this.prevTime); //convert to milliseconds
        const dAngle = this.prevAngle - angle;

        const d = this.D(dAngle, dt, config);
        const p = this.P(error, config);
        const i = this.I(error, dt, config);

        this.prevTime = time;
        this.prevAngle = angle;
        const sum = (config.usePGain ? p : 0) + (config.useIGain ? i : 0) + (config.useDGain ? d : 0);
        if (Math.abs(sum)>config.maxOutput) {
            // console.log(`${this.name}, ${sum} ,${config.maxOutput} @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`);
        }
        return {
            sum: Math.abs(sum) <= config.maxOutput ? sum : config.maxOutput * Math.sign(sum),
            p, i, d
        };
    }

}