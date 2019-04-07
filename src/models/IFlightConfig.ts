import IPIDConfig from './IPIDConfig';
import IRPMConfig from './IRPMConfig';

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
    rpm: IRPMConfig;
    yawPID: IPIDConfig;
    rollPID: IPIDConfig;
    pitchPID: IPIDConfig;
    debug: string;
}