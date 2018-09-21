import ImuData from '../models/ImuData';

export default function(json: string, rollPolarity: number, pitchPolarity: number): ImuData {
    let r = JSON.parse(json);
    return new ImuData(r.roll * rollPolarity, r.pitch * pitchPolarity, r.yaw, r.time);
}


