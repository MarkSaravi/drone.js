import ImuData from '../../models/ImuData';

export default function(imuData: ImuData, label: String = ''): void {
    console.log(`${label}roll: ${imuData.roll}, pitch: ${imuData.pitch}, yaw: ${imuData.yaw}, dt: ${imuData.dt}`);
}