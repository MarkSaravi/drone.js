import IRPMConfig from "../models/IRPMConfig";
import IArmPower from "../models/IArmPower";

export const PowerToRpm = (power: number, config: IRPMConfig): number => {
    return power * config.M + config.Y0;
}

export const RpmToPower = (rpm: number, config: IRPMConfig): number => {
    return (rpm - config.Y0) / config.M;
}

export const BalanceFrontAndEnd = (basePower: number, frontInc: number, config: IRPMConfig): {
    basePower: number,
    frontPower: number,
    backPower: number,
    baseRpm: number,
    frontRpm: number,
    backRpm: number
} => {
    const baseRpm = PowerToRpm(basePower, config);
    const frontPower = basePower - frontInc;
    const frontRpm = PowerToRpm(frontPower, config);
    const backRpm = Math.sqrt(2 * baseRpm * baseRpm - frontRpm * frontRpm);
    const backPower = RpmToPower(backRpm, config);
    return {
        basePower,
        frontPower,
        backPower,
        baseRpm,
        frontRpm,
        backRpm
    }
}
