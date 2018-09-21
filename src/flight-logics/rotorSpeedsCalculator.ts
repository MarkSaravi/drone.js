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

const rotorSpeedCacculator = (angularVelocityBase: number, rollTorque: number, pitchTorque: number, yawTorque: number): IRotorSpeeds => {
    const wAwC = calcTilteCompensationSpeeds(angularVelocityBase, pitchTorque);
    const wBwD = calcTilteCompensationSpeeds(angularVelocityBase, rollTorque);
    return {
        wa: wAwC.first,
        wb: wBwD.first,
        wc: wAwC.second,
        wd: wBwD.second
    }
}

export default rotorSpeedCacculator;

