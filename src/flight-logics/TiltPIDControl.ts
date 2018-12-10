import PIDControl from './PIDControl';
import IArPowers from '../models/IArmPowers';
import IPIDConfig from '../models/IPIDConfig';

export default class TiltPIDControl {
    private pidControl: PIDControl;

    constructor(
        name: string, displayData: boolean = false) {
        this.pidControl = new PIDControl(name, displayData);
    }
    
    PID(basePower: number, error: number, time: number, config: IPIDConfig): IArPowers {
        const torque = this.pidControl.PID(error, time, config, basePower);
        const rotorsSpeeds = {front:  basePower - torque, back: basePower + torque };
        return rotorsSpeeds;
    }

}