import IPIDExtConfig from '../models/IPIDExtConfig';
import PIDControl from './PIDControl';
import IArPowers from '../models/IArmPowers';
import * as flightLogics from './index';
import { basename } from 'path';

export default class TiltPIDControl {
    private pidControl: PIDControl;

    constructor(
        name: string, displayData: boolean = false) {
        this.pidControl = new PIDControl(name, displayData);
    }
    
    PID(basePower: number, error: number, time: number, config: IPIDExtConfig): IArPowers {
        const torque = this.pidControl.PID(error, time, config, basePower);
        const rotorsSpeeds = {front:  basePower - torque, back: basePower + torque };
        return rotorsSpeeds;
    }

}