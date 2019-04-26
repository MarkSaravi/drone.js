export interface IFlightState {
    roll: number,
    pitch: number,
    yaw: number,
    time: number,
    power: number,
}

export default class FlightState implements IFlightState {
    constructor(
        public roll: number,
        public pitch: number,
        public yaw: number,
        public time: number,
        public power: number,
    ) {
    }
}