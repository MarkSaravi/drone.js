import IArmPower from '../models/IArmPower';
import { IPIDValue } from '../models/IPIDValue';
import { BalanceFrontAndEnd } from '../convertors/front-back-power';

export const SumArmPower = (basePower: number, pid: IPIDValue): IArmPower => {
    return {
        front: basePower - pid.sum,
        back: basePower + pid.sum
    }
}

export const frontBackPower = (basePower: number, pid: IPIDValue): IArmPower => {
    const powers = BalanceFrontAndEnd(basePower, pid.sum);
    return {
        front: powers.frontPower,
        back: powers.backPower
    }
}
