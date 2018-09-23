import IDoubleRotorSpeeds from '../models/IDoubleRotorSpeeds';
import IRotorSpeeds from '../models/IRotorSpeeds';

export const calcTilteCompensationSpeeds = (angularVelocityBase: number, torque: number): IDoubleRotorSpeeds => {
    // w3^2 - w1^2 = t
    // w3^2 + w1^2 = 2*wb^2
    // w1^2 + t = 2*wb^2 - w1^2 -> 2*w1^2 = 2*wb^2 - t -> w1 = sqrt(wb^2 - t/2)
    const first = Math.sqrt(angularVelocityBase * angularVelocityBase - torque / 2);
    const second = Math.sqrt(2 * angularVelocityBase * angularVelocityBase - first * first);
    return {
        first,
        second
    }
}

export const calcTurnCompensationSpeeds = (speeds: IRotorSpeeds, torque: number): IRotorSpeeds => {
    return speeds;
}

export const isPositveNumber = (x: number): number => {
    if (isNaN(x)) return 0;
    return x >= 0 ? x : 0
}
const rotorSpeedCacculator = (angularVelocityBase: number, rollTorque: number, pitchTorque: number, yawTorque: number): IRotorSpeeds => {
    const wAwC = calcTilteCompensationSpeeds(angularVelocityBase, pitchTorque);
    const wBwD = calcTilteCompensationSpeeds(angularVelocityBase, rollTorque);
    return {
        wa: isPositveNumber(wAwC.first),
        wb: isPositveNumber(wBwD.first),
        wc: isPositveNumber(wAwC.second),
        wd: isPositveNumber(wBwD.second)
    }
}

export default rotorSpeedCacculator;

