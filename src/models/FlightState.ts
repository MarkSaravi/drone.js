export default class FlightState {
    constructor(roll: number, pitch: number, yaw: number, power: number) {
        this.Roll = roll;
        this.Pitch = pitch;
        this.Power = power;
        this.Yaw = yaw;
    }
    readonly Roll: number;
    readonly Pitch: number;
    readonly Yaw: number;
    readonly Power: number;
}