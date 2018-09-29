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

    PID(basePower: number, errors: IFlightStateError, config: IFlightConfig): IPowers {
        const pitchPower = basePower;
        const pitchPowers = this.pitchControl.PID(pitchPower, errors.pitchError, errors.time, config);
        
        return {
            p1: pitchPowers.front,
            p2: 0,
            p3: pitchPowers.back,
            p4: 0
        }
    }

}