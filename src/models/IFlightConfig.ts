import IPIDConfig from './IPIDConfig';

export interface IMotorsPowerSupressConfig {
    a: boolean;
    b: boolean;
    c: boolean;
    d: boolean;
}

export interface IImuDataSupressConfig {
    roll: boolean;
    pitch: boolean;
    yaw: boolean;
}

 export interface IRemoteControlConfig {
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
    motors: IMotorsPowerSupressConfig;
    suppress: IImuDataSupressConfig;
    pitchPolarity: number;
    yawPolarity: number;
    maxAngle: number;
    minPower: number;
    maxPower: number;
    useRollPIDForPitchPID: boolean;
    remoteControl: IRemoteControlConfig;
    yawPID: IPIDConfig;
    rollPID: IPIDConfig;
    pitchPID: IPIDConfig;
    rollOffset: number;
    pitchOffset: number;
    rollOffsetInc: number;
    pitchOffsetInc: number;
    debug: string;
}