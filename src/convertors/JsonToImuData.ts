import ImuData from '../models/ImuData';
import { RotateAroundZ } from './EulerTransforms';

export default function(json: string): ImuData {
    let r = JSON.parse(json);
    let [nr, np] = RotateAroundZ(r.roll, r.pitch, Math.PI / 4);
    return new ImuData(nr, np, r.yaw, r.dt);
}


