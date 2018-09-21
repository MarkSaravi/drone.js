import IDoubleRotorSpeeds from '../models/IDoubleRotorSpeeds';
import IRotorSpeeds from '../models/IRotorSpeeds';

export const calcTilteCompensationSpeeds = (angularVelocityBase: number, torque: number): IDoubleRotorSpeeds => {
    // w3^2 - w1^2 = t
    // w3^2 + w1^2 = 2*wb^2
    // w1^2 + t = 2*wb^2 - w1^2 -> 2*w1^2 = 2*wb^2 - t -> w1 = sqrt(wb^2 - t/2)
    const w1 = Math.sqrt(angularVelocityBase * angularVelocityBase - torque / 2);
    const w3 = Math.sqrt(2 * angularVelocityBase * angularVelocityBase - w1 * w1);
    return {
        w1,
        w3
    }
}

const rotorSpeedCacculator = (angularVelocityBase: number, rollTorque: number, pitchTorque: number, yawTorque: number): IRotorSpeeds => {
    return {
        wa: 0,
        wb: 0,
        wc: 0,
        wd: 0
    }
}

export default rotorSpeedCacculator;

