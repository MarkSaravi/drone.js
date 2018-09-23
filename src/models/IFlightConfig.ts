export default interface IFlightConfig {
    rollPolarity: number;
    pitchPolarity: number;
    yawPolarity: number;
    maxAngle: number;
    pGain: number;
    iGain: number;
    dGain: number;
    usePGain: boolean,
    useIGain: boolean,
    useDGain: boolean,
    pGainInc: number;
    iGainInc: number;
    dGainInc: number;
    iMaxValue: number;
    iMaxAngle: number;
    iMinAngle: number;
    gain: number;
    mRpm: number;
    bRpm: number;
    saveData: boolean
}