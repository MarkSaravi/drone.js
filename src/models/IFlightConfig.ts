import IPIDConfig from './IPIDConfig';
import IPIDExtConfig from './IPIDExtConfig';

export default interface IFlightConfig {
    rollPolarity: number;
    pitchPolarity: number;
    yawPolarity: number;
    yawPID: IPIDConfig;
    rollPitchPID: IPIDExtConfig;
}