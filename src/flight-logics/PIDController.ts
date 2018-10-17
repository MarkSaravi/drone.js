import IFlightStateError from '../models/IFlightStateError';
import IPowers from '../models/IPowers';
import IFlightConfig from '../models/IFlightConfig';
import TiltPIDControl from './TiltPIDControl';
import PIDControl from './PIDControl';

export default class PIDController {
    rollControl: TiltPIDControl;
    pitchControl: TiltPIDControl;
    yawControl: PIDControl;

    constructor(private readonly config: IFlightConfig) {
        this.rollControl = new TiltPIDControl();
        this.pitchControl = new TiltPIDControl();
        this.yawControl = new PIDControl();
    }

    convert(x: number) {
        return x;
    }

    PID(basePower: number, errors: IFlightStateError, config: IFlightConfig): IPowers {
        const yawError = errors.pitchError;
        const yawPID = this.yawControl.PID(yawError, errors.time, config.yawPID, basePower);
        
        const pitchError = this.convert(errors.pitchError);
        const rollError = this.convert(errors.rollError);
        const pitchPower = basePower;
        const rollPower = basePower;
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