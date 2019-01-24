import IRPMConfig from "../models/IRPMConfig";

export const PowerToRpm = (power: number, config: IRPMConfig): number => {
    return power * config.M + config.Y0;
}

export const RpmToPower = (rpm: number, config: IRPMConfig): number => {
    return (rpm - config.Y0) / config.M;
}

export const PairPowerChange = (power: number, pid: number): { front: number; back: number } => {
    return {
        front: 0,
        back: 0
    }
}