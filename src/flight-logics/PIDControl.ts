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

    P(errors: IFlightStateError, config: IFlightConfig): ITorqueResponse {
        return {
            rollTorque: errors.rollError * config.pGain,
            pitchTorque: errors.pitchError * config.pGain,
            yawTorque: errors.yawError * config.pGain
        }
    }

    IMaxLimit(value: number, inc: number, config: IFlightConfig): number {
        if (Math.abs(value + inc) <= config.iMax) {
            return value + inc;
        }
        return value;
    }

    I(errors: IFlightStateError, config: IFlightConfig, dt: number): ITorqueResponse {
        
        this.integralSumRoll = this.IMaxLimit(this.integralSumRoll, (this.prevError.rollError + errors.rollError) / 2, config);
        this.integralSumPitch = this.IMaxLimit(this.integralSumPitch, (this.prevError.pitchError + errors.pitchError) / 2, config);
        this.integralSumYaw = this.IMaxLimit(this.integralSumYaw ,(this.prevError.yawError + errors.yawError) / 2, config);
        return {
            rollTorque: this.integralSumRoll * config.iGain,
            pitchTorque: this.integralSumPitch * config.iGain,
            yawTorque: this.integralSumYaw * config.iGain
        }
    }

    D(errors: IFlightStateError, config: IFlightConfig, dt: number): ITorqueResponse {
        return {
            rollTorque: (this.prevError.rollError - errors.rollError) / dt * config.dGain,
            pitchTorque: (this.prevError.pitchError - errors.pitchError) / dt * config.dGain,
            yawTorque: (this.prevError.yawError - errors.yawError) / dt * config.dGain
        }
    }

    apply(tsum: ITorqueResponse, t: ITorqueResponse, type: string): ITorqueResponse {
        const r = {
            rollTorque: tsum.rollTorque + t.rollTorque,
            pitchTorque: tsum.pitchTorque + t.pitchTorque,
            yawTorque: tsum.yawTorque + t.yawTorque
        }
        if (type == 'I') {
           // console.log(`${type} torques: roll: ${(t.rollTorque).toFixed(3)}, pitch: ${(t.pitchTorque).toFixed(3)}, yaw: ${(t.yawTorque).toFixed(3)}`);
        }
        return r;
    }

    showState(tr: ITorqueResponse, pv: ICalculatedPowers, fsv: IFlightStateError, msg: string) {
        const ts = `r: ${(tr.rollTorque).toFixed(3)} ,p: ${(tr.pitchTorque).toFixed(3)} ,y: ${(tr.yawTorque).toFixed(3)}`;
        const ps = `a: ${(pv.p1).toFixed(3)} ,b: ${(pv.p2).toFixed(3)} ,c: ${(pv.p3).toFixed(3)} ,d: ${(pv.p4).toFixed(3)}`;
        const fss = `roll: ${(fsv.rollError).toFixed(3)}, pitch: ${(fsv.pitchError).toFixed(3)} ,yaw${(fsv.yawError).toFixed(3)}`;
        const text = `${ts}, ${ps}, ${fss}, ${msg}`;
        //console.log(text);
    }

    PID(basePower: number, errors: IFlightStateError, config: any): ICalculatedPowers {
        if (this.prevError == null) {
            this.prevError = errors;
        }
        const dt = errors.dt - this.prevError.dt; //sample value: 19.644
        let t : ITorqueResponse = {rollTorque: 0, pitchTorque: 0, yawTorque: 0};
        
        t = this.apply(t, this.P(errors, config),"P");
        t = this.apply(t, this.I(errors, config, dt), "I");
        t = this.apply(t, this.D(errors, config, dt), "D");
        t = {
            rollTorque: t.rollTorque * config.gain,
            pitchTorque: t.pitchTorque * config.gain,
            yawTorque: t.yawTorque * config.gain
        }
        const dpower = torqueCalculator(basePower, t.rollTorque, t.pitchTorque, t.yawTorque);
        this.prevError = errors;
        return dpower;
    }

}