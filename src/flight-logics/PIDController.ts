import IFlightStateError from '../models/IFlightStateError';
import IPowers from '../models/IPowers';
import IFlightConfig from '../models/IFlightConfig';
import PIDControl from './PIDControl';

export default class PIDController {
    rollControl: PIDControl;
    pitchControl: PIDControl;
    // yawControl: PIDControl;

    constructor(private readonly config: IFlightConfig) {
        this.rollControl = new PIDControl();
        this.pitchControl = new PIDControl();
        // this.yawControl = new PIDControl(config);
    }

    PID(basePower: number, errors: IFlightStateError, config: IFlightConfig): IPowers {
        return {
            p1: basePower,
            p2: basePower,
            p3: basePower,
            p4: basePower
        }
    }

}