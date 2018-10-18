import IPIDConfig from './IPIDConfig';
import IPIDExtConfig from './IPIDExtConfig';

export default interface IFlightConfig {
    rollPolarity: number;
    pitchPolarity: number;
    yawPolarity: number;
    minTakeOffPower: number,
    mRpm: number;
    bRpm: number;
    saveData: boolean;
    yawPID: IPIDConfig;
    rollPitchPID: IPIDExtConfig;
}