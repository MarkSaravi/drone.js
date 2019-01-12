export interface ITilt {
    roll: number;
    pitch: number;
}

export default class FlightState {
    constructor(
        readonly roll: number,
        readonly pitch: number,
        readonly yaw: number,
        readonly time: number,
        public power: number,
    ){
    }
}