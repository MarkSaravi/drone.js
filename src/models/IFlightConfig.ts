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

 export interface RemoteControl {
    minInputPower: number,
    maxInputPower: number,
    minInputRoll: number,
    maxInputRoll: number,
    minInputPitch: number,
    maxInputPitch: number,
    minInputYaw: number,
    maxInputYaw: number,
    maxRoll: number,
    maxPitch: number,
    maxYaw: number
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
    remoteControl: RemoteControl;
    yawPID: IPIDConfig;
    rollPID: IPIDConfig;
    pitchPID: IPIDConfig;
    rollOffset: number;
    pitchOffset: number;
    rollOffsetInc: number;
    pitchOffsetInc: number;
    debug: string;
}