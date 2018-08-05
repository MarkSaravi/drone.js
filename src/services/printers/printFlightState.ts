import FlightState from '../../models/FlightState';

export default function(state: FlightState, label: String = ''): void {
    console.log(`${label}roll: ${state.roll}, pitch: ${state.pitch}, yaw: ${state.yaw}, power: ${state.power}`);
}