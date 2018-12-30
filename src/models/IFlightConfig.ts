import IPIDConfig from './IPIDConfig';
export interface Motors {
    a: boolean;
    b: boolean;
    c: boolean;
    d: boolean;
}

export default interface IFlightConfig {
    rollPolarity: number;
    motors: Motors;
    pitchPolarity: number;
    yawPolarity: number;
    maxAngle: number;
    yawPID: IPIDConfig;
    rollPitchPID: IPIDConfig;
}