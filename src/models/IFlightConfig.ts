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
    useRollPIDForPitchPID: boolean;
    yawPID: IPIDConfig;
    rollPID: IPIDConfig;
    pitchPID: IPIDConfig;
    rollOffset: number;
    pitchOffset: number;
    rollOffsetInc: number;
    pitchOffsetInc: number;
    debug: string;
}