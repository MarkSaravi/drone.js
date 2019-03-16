export interface ITilt {
    roll: number;
    pitch: number;
}

export default class FlightState {
    constructor(
        public roll: number,
        public pitch: number,
        public yaw: number,
        public time: number,
        public power: number,
    ){
    }
}