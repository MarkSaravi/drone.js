import IRPMConfig from "../models/IRPMConfig";
import IArmPower from "../models/IArmPower";

export const PowerToRpm = (power: number, config: IRPMConfig): number => {
    return power * config.M + config.Y0;
}

export const RpmToPower = (rpm: number, config: IRPMConfig): number => {
    return (rpm - config.Y0) / config.M;
}

export const quadratic = (base: number, inc: number): number => {
    try {
        const x = base + inc
        const a = 1;
        const b = 2 * base;
        const c = x * x - base * base;
        const delta = b * b - 4 * a * c;
        const y1 = (-b + Math.sqrt(delta)) / 2 / a;
        const y2 = (-b - Math.sqrt(delta)) / 2 / a;
        return Math.abs(y1) < base ? y1 : y2;
    } catch {
    }
    return 0;
}

export const PairPowerChange = (power: number, pid: number, config: IRPMConfig): IArmPower => {
    const rpm = PowerToRpm(power, config);

    return {
        front: 0,
        back: 0
    }
}

/*


F^2+B^2=2*W^2

(W+x)^2+(W+y)^2=2*W^2

x^2 + 2*x*W + (W+y)^2-2*W^2


W=7000
a=100

7100*7100 + 7000*7000+2*7000+b+b*b = 2*7000*7000
b^2+2*7000*b + 7100*7100-7000*7000=0
*/