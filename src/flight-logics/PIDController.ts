import IFlightStateError from '../models/IFlightStateError';
import ITorqueResponse from '../models/ITorqueResponse';
import IFlightConfig from '../models/IFlightConfig';
import PIDControl from './PIDControl';

export default class PIDController {
    rollControl: PIDControl;
    pitchControl: PIDControl;
    // yawControl: PIDControl;

    constructor(private readonly config: IFlightConfig) {
        this.rollControl = new PIDControl(config);
        this.pitchControl = new PIDControl(config);
        // this.yawControl = new PIDControl(config);
    }


    PID(errors: IFlightStateError, config: IFlightConfig): ITorqueResponse {
        const tsum = {
            rollTorque: this.rollControl.PID(errors.rollError, errors.time, config.pGain, config.iGain, config.dGain),
            pitchTorque: this.pitchControl.PID(errors.pitchError, errors.time, config.pGain, config.iGain, config.dGain),
            yawTorque: 0
        }
        return tsum;
    }

}