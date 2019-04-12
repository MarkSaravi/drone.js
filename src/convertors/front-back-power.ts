export const BalanceFrontAndEnd = (basePower: number, frontInc: number): {
    basePower: number,
    frontPower: number,
    backPower: number
} => {
    const frontPower = basePower - frontInc;
    const backPower = basePower + frontInc;
    return {
        basePower,
        frontPower,
        backPower
    }
}
