import IArmPower from '../models/IArmPower';
import { IPIDValue } from '../models/IPIDValue';

export const SumArmPower = (basePower: number, pid: IPIDValue): IArmPower => {
    return {
        front: basePower - pid.sum,
        back: basePower + pid.sum
    }
}

export const RpmArmPower = (basePower: number, pid: IPIDValue): IArmPower => {
    return {
        front: basePower - pid.sum,
        back: basePower + pid.sum
    }
}
