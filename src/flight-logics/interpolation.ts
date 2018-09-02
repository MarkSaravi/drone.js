const interpolation = (x: number, values: any): number => {
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

const powerToAngularVelocity = (power: number, aFactor: number, bFactor: number): number => {
    const rpm = power * aFactor + bFactor;
    const angularVelocity = rpm / 60 * 2 * Math.PI;
    return angularVelocity;
} 

const angularVelocityToPower = (angularVelocity: number, aFactor: number, bFactor: number): number => {
    const rpm = angularVelocity / Math.PI / 2 * 60;
    const power = (rpm - bFactor) / aFactor;
    return power;
} 

export { powerToAngularVelocity };
export { interpolation };
export { angularVelocityToPower };