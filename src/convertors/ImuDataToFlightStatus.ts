import FlightState from '../models/FlightState';
import ImuData from '../models/ImuData';

function ImuDataToFlightStatus(imuData: ImuData, curr: FlightState): FlightState {
    return new FlightState(imuData.roll, imuData.pitch, imuData.yaw, curr.power);
}
export default ImuDataToFlightStatus;