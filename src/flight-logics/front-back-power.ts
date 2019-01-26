import IArmPower from '../models/IArmPower';
import { IPIDValue } from '../models/IPIDValue';
import IRPMConfig from '../models/IRPMConfig';
import { PowerToRpm, RpmToPower, BalanceFrontAndEnd } from '../convertors/power-to-rpm';

export const SumArmPower = (basePower: number, pid: IPIDValue): IArmPower => {
    return {
        front: basePower - pid.sum,
        back: basePower + pid.sum
    }
}

export const RpmArmPower = (basePower: number, pid: IPIDValue, config: IRPMConfig): IArmPower => {
    const powers = BalanceFrontAndEnd(basePower, pid.sum, config);
    return {
        front: powers.frontPower,
        back: powers.backPower
    }
}
