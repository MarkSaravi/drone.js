import IFlightState from '../models/IFlightState';
import ImuData from '../models/ImuData';

function ImuDataToFlightStatus(imuData: ImuData): { imu: IFlightState, time: number } {
    return {
        imu: { roll: imuData.roll, pitch: imuData.pitch, yaw: imuData.yaw },
        time: imuData.time / 1000
    };
}
export default ImuDataToFlightStatus;