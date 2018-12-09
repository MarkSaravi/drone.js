import FlightState from '../models/FlightState';
import ImuData from '../models/ImuData';

function ImuDataToFlightStatus(imuData: ImuData): FlightState {
    const yawLimit = 3;
    const yaw = Math.abs(imuData.yaw )> yawLimit ? yawLimit * Math.sign(imuData.yaw): imuData.yaw;
    return new FlightState(imuData.roll, imuData.pitch, yaw, imuData.time, 0);
}
export default ImuDataToFlightStatus;