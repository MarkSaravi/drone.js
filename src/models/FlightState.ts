export default class FlightState {
    constructor(
        readonly roll: number,
        readonly pitch: number,
        readonly yaw: number,
        readonly dt: number,
        public power: number,
    ){
    }
}