import IFlightState from '../models/IFlightState';
import ImuData from '../models/ImuData';

function ImuDataToFlightStatus(imuData: ImuData): IFlightState {
    return {roll: imuData.roll, pitch: imuData.pitch, yaw: imuData.yaw, time: imuData.time / 1000, power: 0};
}
export default ImuDataToFlightStatus;