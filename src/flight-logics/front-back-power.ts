import IArmPower from '../models/IArmPower';
import { IPIDValue } from '../models/IPIDValue';
import IRPMConfig from '../models/IRPMConfig';
import { BalanceFrontAndEnd } from '../convertors/front-back-power';

export const SumArmPower = (basePower: number, pid: IPIDValue): IArmPower => {
    return {
        front: basePower - pid.sum,
        back: basePower + pid.sum
    }
}

export const RpmArmPower = (basePower: number, pid: IPIDValue, config: IRPMConfig): IArmPower => {
    const powers = BalanceFrontAndEnd(basePower, pid.sum);
    return {
        front: powers.frontPower,
        back: powers.backPower
    }
}
