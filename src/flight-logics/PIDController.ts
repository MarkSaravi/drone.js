import IFlightStateError from '../models/IFlightStateError';
import ITorqueResponse from '../models/ITorqueResponse';
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


    PID(errors: IFlightStateError, config: IFlightConfig): ITorqueResponse {
        const tsum = {
            rollTorque: this.rollControl.PID(errors.rollError, errors.time, config) * config.gain,
            pitchTorque: this.pitchControl.PID(errors.pitchError, errors.time, config) * config.gain,
            yawTorque: 0
        }
        return tsum;
    }

}