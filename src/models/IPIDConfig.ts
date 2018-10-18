export default interface IPIDConfig {
    gain: number;
    pGain: number;
    iGain: number;
    dGain: number;
    usePGain: boolean;
    useIGain: boolean;
    useDGain: boolean;
    pGainInc: number;
    iGainInc: number;
    dGainInc: number;
    iMinPower: number;
    iMaxValue: number;
    iMaxAngle: number;
    iMinAngle: number;
} 