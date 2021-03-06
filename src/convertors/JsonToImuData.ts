import ImuData from '../models/ImuData';

export default function (
    json: string,
    rollPolarity: number,
    pitchPolarity: number,
    yawPolarity: number): ImuData {
    try {
        let r = JSON.parse(json);
        return new ImuData(r.r * rollPolarity, r.p * pitchPolarity, r.y * yawPolarity, r.t);
    } catch (err) {
        return null;
    }
}


