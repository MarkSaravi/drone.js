const roundErro = (value: number): number => {
    return Math.round(value * 10) / 10;
}

const noiseFilter = (value: number, prevFilteredValue: number): number => {
    const w = 0.45;
    const y = w * value + (1 - w) * prevFilteredValue;
    return y;
}
export { roundErro };
export { noiseFilter };