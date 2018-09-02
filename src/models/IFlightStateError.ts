export default interface IFlightStateError {
    rollError: number;
    pitchError: number;
    yawError: number;
    dt: number;
    powerError: number;
    altitudeError: number;
}