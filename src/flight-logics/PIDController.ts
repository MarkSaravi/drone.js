import IFlightStateError from '../models/IFlightStateError';
import IPowers from '../models/IPowers';
import IFlightConfig from '../models/IFlightConfig';
import TiltPIDControl from './TiltPIDControl';

export default class PIDController {
    rollControl: TiltPIDControl;
    pitchControl: TiltPIDControl;
    // yawControl: TurnPIDControl;
    private pitchError: number = 0;
    private rollError: number =0;

    constructor(private readonly config: IFlightConfig) {
        this.rollControl = new TiltPIDControl();
        this.pitchControl = new TiltPIDControl();
        // this.yawControl = new TurnPIDControl();
    }

    PID(basePower: number, errors: IFlightStateError, config: IFlightConfig): IPowers {
        this.pitchError = errors.pitchError ;// this.pitchError + 0.45 * (errors.pitchError - this.pitchError); 
        this.rollError = errors.rollError;
        const pitchPower = basePower;
        const rollPower = basePower;
        const pitchPowers = this.pitchControl.PID(pitchPower, this.pitchError, errors.time, config);
        const rollPowers = this.rollControl.PID(rollPower, this.rollError, errors.time, config);
        
        return {
            p1: pitchPowers.front,
            p2: rollPowers.front,
            p3: pitchPowers.back,
            p4: rollPowers.back
        }
    }

}