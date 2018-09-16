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
            rollTorque: errors.rollError,
            pitchTorque: errors.pitchError ,
            yawTorque: errors.yawError
        }
    }

    I(errors: IFlightStateError, config: IFlightConfig, dt: number): ITorqueResponse {
        const limit = (x: number, y: number) =>  Math.abs(x + y) < config.iMax ? x + y : x;
        this.integralSumRoll = limit(this.integralSumRoll, (errors.rollError) * dt);
        this.integralSumPitch = limit(this.integralSumPitch, (errors.pitchError) * dt);
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
            rollTorque: (errors.rollError - this.prevError.rollError) / dt,
            pitchTorque: (errors.pitchError - this.prevError.pitchError) / dt,
            yawTorque: (errors.yawError - this.prevError.yawError) / dt
        }
    }

    PID(errors: IFlightStateError, config: IFlightConfig): ITorqueResponse {
        if (this.prevError == null) {
            this.prevError = errors;
            this.prevError.time =this.prevError.time - 10; //10 milliseconds back
        }
        const dt = (errors.time - this.prevError.time) / 1000; //convert to milliseconds
        
        const tp = config.usePGain ? this.P(errors, config) : {rollTorque: 0, pitchTorque: 0, yawTorque: 0};
        const ti = config.useIGain ? this.I(errors, config, dt) : {rollTorque: 0, pitchTorque: 0, yawTorque: 0};
        const td = config.useDGain ? this.D(errors, config, dt) : {rollTorque: 0, pitchTorque: 0, yawTorque: 0};
        const tsum = {
            rollTorque: (tp.rollTorque * config.pGain + ti.rollTorque * config.iGain + td.rollTorque * config.dGain) * config.gain,
            pitchTorque: (tp.pitchTorque * config.pGain  + ti.pitchTorque * config.iGain + td.pitchTorque * config.dGain) * config.gain,
            yawTorque: 0
        }
        this.prevError = errors;
        return tsum;
    }

}