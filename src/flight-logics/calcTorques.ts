function calcTorques(wb: number, tr: number, tp: number, ty: number): [number, number, number, number] {
    const k1: number = -tp / 4 / wb;
    const w1: number = wb + k1;
    const w3: number = wb - k1;
    const w2: number = Math.sqrt((2 * w1 * w1 + ty - tr + tp) / 2);
    const k2: number = w2 - wb;
    const w4: number = Math.sqrt(w2 * w2 + tr);
    return [w1, w2, w3, w3];
}

export default calcTorques;
