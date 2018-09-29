import IFlightConfig from '../models/IFlightConfig';
import PIDControl from './PIDControl';
import IArPowers from '../models/IArmPowers';
import * as flightLogics from './index';

export default class TiltPIDControl {
    private pidControl: PIDControl;

    constructor() {
        this.pidControl = new PIDControl();
    }

    PID(basePower: number, error: number, time: number, config: IFlightConfig): IArPowers {
        const baseAangularVelocity = flightLogics.powerToAngularVelocity(basePower, config.mRpm, config.bRpm);
        const torque = this.pidControl.PID(error, time, config);
        const rotorsSpeeds = flightLogics.rotorSpeedCacculator(baseAangularVelocity, torque);
        const front = flightLogics.angularVelocityToPower(rotorsSpeeds.front, config.mRpm, config.bRpm);
        const back = flightLogics.angularVelocityToPower(rotorsSpeeds.back, config.mRpm, config.bRpm);
        return {
            front,
            back
        };
    }

}