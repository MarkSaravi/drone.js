import IFlightStateError from '../models/IFlightStateError';
import IPowers from '../models/IPowers';
import IFlightConfig from '../models/IFlightConfig';
import TiltPIDControl from './TiltPIDControl';
import PIDControl from './PIDControl';

export default class PIDController {
    rollControl: TiltPIDControl;
    pitchControl: TiltPIDControl;
    yawControl: PIDControl;

    constructor() {
        this.rollControl = new TiltPIDControl('roll', true);
        this.pitchControl = new TiltPIDControl('pitch', true);
        this.yawControl = new PIDControl('yaw', true);
    }

    convert(x: number) {
        return x;
    }

    PID(basePower: number, errors: IFlightStateError, config: IFlightConfig): IPowers {
        const yawError = Math.abs(errors.yawError) < 5 ?
         errors.yawError : 5 * Math.sign(errors.yawError);
        const pitchError = errors.pitchError;
        const rollError = errors.rollError;

        const yawPID = this.yawControl.PID(yawError, errors.time, config.yawPID, basePower);        
        const pitchPower = basePower - yawPID;
        const rollPower = basePower + yawPID;
        const pitchPowers = this.pitchControl.PID(pitchPower, pitchError, errors.time, config.rollPitchPID);
        const rollPowers = this.rollControl.PID(rollPower, rollError, errors.time, config.rollPitchPID);
        
        return {
            p1: pitchPowers.front,
            p2: rollPowers.front,
            p3: pitchPowers.back,
            p4: rollPowers.back
        }
    }

}