import IPIDConfig from './IPIDConfig';

export default interface IFlightConfig {
    rollPolarity: number;
    pitchPolarity: number;
    yawPolarity: number;
    maxAngle: number;
    yawPID: IPIDConfig;
    rollPitchPID: IPIDConfig;
}