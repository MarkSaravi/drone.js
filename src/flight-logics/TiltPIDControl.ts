import IPIDConfig from '../models/IPIDConfig';
import PIDControl from './PIDControl';
import IArPowers from '../models/IArmPowers';
import * as flightLogics from './index';

export default class TiltPIDControl {
    private pidControl: PIDControl;

    constructor() {
        this.pidControl = new PIDControl();
    }

    isPositveNumber = (x: number): number => {
        if (isNaN(x)) return 0;
        return x > 0 ? x : 0
    }
    
    PID(basePower: number, error: number, time: number, config: IPIDConfig): IArPowers {
        const baseAangularVelocity = flightLogics.powerToAngularVelocity(basePower, config.mRpm, config.bRpm);
        const torque = this.pidControl.PID(error, time, config, basePower) * config.gain;
        const rotorsSpeeds = {front:  baseAangularVelocity - torque, back: baseAangularVelocity + torque };
        const front = this.isPositveNumber(flightLogics.angularVelocityToPower(rotorsSpeeds.front, config.mRpm, config.bRpm));
        const back = this.isPositveNumber(flightLogics.angularVelocityToPower(rotorsSpeeds.back, config.mRpm, config.bRpm));
        return {
            front,
            back
        };
    }

}