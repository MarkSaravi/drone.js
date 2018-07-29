export function RotateAroundZ(roll: number, pitch: number, a: number):[number, number] {
    let nroll = Math.cos(a) * roll - Math.sin(a) * pitch;
    let npitch = Math.sin(a) * roll + Math.cos(a) * pitch;
    return [nroll, npitch];
}
