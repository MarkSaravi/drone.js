import IRotorSpeeds from '../models/IRotorSpeeds';

const rotorSpeedCacculator = (angularVelocityBase, rollTorque, pitchTorque, yawTorque): IRotorSpeeds => {
    return {
        wa: 0,
        wb: 0,
        wc: 0,
        wd: 0
    }
}



