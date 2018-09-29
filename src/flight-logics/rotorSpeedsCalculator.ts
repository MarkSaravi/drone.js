import IArmRotorSpeeds from '../models/IArmRotorSpeeds';

export const calcTilteCompensationSpeeds = (angularVelocityBase: number, torque: number): IArmRotorSpeeds => {
    // w3^2 - w1^2 = t
    // w3^2 + w1^2 = 2*wb^2
    // w1^2 + t = 2*wb^2 - w1^2 -> 2*w1^2 = 2*wb^2 - t -> w1 = sqrt(wb^2 - t/2)
    const front = Math.sqrt(angularVelocityBase * angularVelocityBase - torque / 2);
    const back = Math.sqrt(2 * angularVelocityBase * angularVelocityBase - front * front);
    return {
        front,
        back
    }
}

const rotorSpeedCacculator = (angularVelocityBase: number, torque: number): IArmRotorSpeeds => {
    const { front, back } = calcTilteCompensationSpeeds(angularVelocityBase, torque);
    return {
        front,
        back,
    }
}

export default rotorSpeedCacculator;

