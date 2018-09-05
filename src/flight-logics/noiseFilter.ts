// function smoother(xn: number, yn_1: number): number {
//     const w = 0.45;
//     //yn = w × xn + (1 – w) × yn – 1
//     const yn = w * xn + (1 - w) * yn_1;
//     return yn;
// }
const noiseFilter = (value: number, prevFilteredValue: number): number => {
    const w = 0.45;
    const y = w * value + (1 - w) * prevFilteredValue;
    return y;

}

export default noiseFilter;