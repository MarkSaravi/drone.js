export default function interpolation(x: number, values: any): number {
    let y = 0;
    for (let i = 0; i < values.length; i++) {
        let k = values[i].y;
        for (let j=0; j< values.length; j++) {
            if (i == j) {
                continue;
            };
            k = k * (x - values[j].x)/(values[i].x - values[j].x);
        }
        y += k;
    }
    return y;
}