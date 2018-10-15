import IFlightStateError from '../models/IFlightStateError';
import IPowers from '../models/IPowers';
import IFlightConfig from '../models/IFlightConfig';
import TiltPIDControl from './TiltPIDControl';

export default class PIDController {
    rollControl: TiltPIDControl;
    pitchControl: TiltPIDControl;
    // yawControl: TurnPIDControl;

    constructor(private readonly config: IFlightConfig) {
        this.rollControl = new TiltPIDControl();
        this.pitchControl = new TiltPIDControl();
        // this.yawControl = new TurnPIDControl();
    }

    convert(x: number) {
        return x;
    }

    PID(basePower: number, errors: IFlightStateError, config: IFlightConfig): IPowers {
        const pitchError = this.convert(errors.pitchError);
        const rollError = this.convert(errors.rollError);
        const pitchPower = basePower;
        const rollPower = basePower;
        const pitchPowers = this.pitchControl.PID(pitchPower, pitchError, errors.time, config);
        const rollPowers = this.rollControl.PID(rollPower, rollError, errors.time, config);
        // const pitchPowers = { front: 0, back: 0 };
        
        return {
            p1: pitchPowers.front,
            p2: rollPowers.front,
            p3: pitchPowers.back,
            p4: rollPowers.back
        }
    }

}