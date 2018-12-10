import FlightState from '../models/FlightState';
import ImuData from '../models/ImuData';

function ImuDataToFlightStatus(imuData: ImuData): FlightState {
    return new FlightState(imuData.roll, imuData.pitch, imuData.yaw, imuData.time / 1000, 0);
}
export default ImuDataToFlightStatus;