import FlightState from '../models/FlightState';
import ImuData from '../models/ImuData';

function ImuDataToFlightStatus(imuData: ImuData): FlightState {
    return new FlightState(imuData.roll, imuData.pitch, 0, imuData.time, 0);
}
export default ImuDataToFlightStatus;