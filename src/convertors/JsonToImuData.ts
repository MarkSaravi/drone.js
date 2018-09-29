import ImuData from '../models/ImuData';

export default function(json: string, rollPolarity: number, pitchPolarity: number): ImuData {
    let r = JSON.parse(json);
    return new ImuData(r.r * rollPolarity, r.r * pitchPolarity, r.y, r.t);
}


