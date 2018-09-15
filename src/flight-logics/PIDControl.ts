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

    I(errors: IFlightStateError, config: IFlightConfig, dt: number): ITorqueResponse {
        const limit = (x: number, y: number) =>  Math.abs(x + y) < config.iMax ? x + y : x;
        this.integralSumRoll = limit(this.integralSumRoll, (errors.rollError) * dt * config.iGain);
        this.integralSumPitch = limit(this.integralSumPitch, (errors.pitchError) * dt * config.iGain);
        // console.log(this.integralSumRoll);
        // console.log(this.integralSumPitch);
        this.integralSumYaw = 0;
        return {
            rollTorque: this.integralSumRoll,
            pitchTorque: this.integralSumPitch,
            yawTorque: this.integralSumYaw
        }
    }

    D(errors: IFlightStateError, config: IFlightConfig, dt: number): ITorqueResponse {
        return {
            rollTorque: (errors.rollError - this.prevError.rollError) / dt * config.dGain,
            pitchTorque: (errors.pitchError - this.prevError.pitchError) / dt * config.dGain,
            yawTorque: (errors.yawError - this.prevError.yawError) / dt * config.dGain
        }
    }

    PID(errors: IFlightStateError, config: any): ITorqueResponse {
        if (this.prevError == null) {
            this.prevError = errors;
            this.prevError.time =this.prevError.time - 10; //10 milliseconds back
        }
        const dt = (errors.time - this.prevError.time) / 1000; //convert to milliseconds
        
        const tp = config.usePGain ? this.P(errors, config) : {rollTorque: 0, pitchTorque: 0, yawTorque: 0};
        const ti = config.useIGain ? this.I(errors, config, dt) : {rollTorque: 0, pitchTorque: 0, yawTorque: 0};
        const td = config.useDGain ? this.D(errors, config, dt) : {rollTorque: 0, pitchTorque: 0, yawTorque: 0};
        const tsum = {
            rollTorque: (tp.rollTorque + ti.rollTorque + td.rollTorque) * config.gain,
            pitchTorque: (tp.pitchTorque + ti.pitchTorque + td.pitchTorque) * config.gain,
            yawTorque: (tp.yawTorque + ti.yawTorque + td.yawTorque) * config.gain
        }
        this.prevError = errors;
        return tsum;
    }

}