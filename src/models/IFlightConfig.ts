import IPIDConfig from './IPIDConfig';
export interface Motors {
    a: boolean;
    b: boolean;
    c: boolean;
    d: boolean;
}

export interface Suppress {
    roll: boolean;
    pitch: boolean;
    yaw: boolean;
}
export default interface IFlightConfig {
    rollPolarity: number;
    motors: Motors;
    suppress: Suppress;
    pitchPolarity: number;
    yawPolarity: number;
    maxAngle: number;
    minPower: number;
    maxPower: number;
    yawPID: IPIDConfig;
    rollPitchPID: IPIDConfig;
    debug: string;
}