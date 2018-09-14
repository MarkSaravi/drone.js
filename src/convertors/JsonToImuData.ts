import ImuData from '../models/ImuData';

export default function(json: string): ImuData {
    let r = JSON.parse(json);
    return new ImuData(r.roll, r.pitch, r.yaw, r.time);
}


