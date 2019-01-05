import IFlightStateError from '../models/IFlightStateError';
import { IPIDValue } from '../models/IPIDValue';
import IPIDConfig from '../models/IPIDConfig';
import IFlightConfig from '../models/IFlightConfig';
import IPowers from '../models/IPowers';
import { fixNum } from '../common';

export default function showStatus(
    power: number,
    config: IFlightConfig,
    errors: IFlightStateError,
    rollPID: IPIDValue,
    pitchPID: IPIDValue,
    yawPID: IPIDValue,
    powers: IPowers

    ) 
{
    process.stdout.write(`power:${power},`);
    process.stdout.write(`rpPID:${config.rollPitchPID.pGain},${config.rollPitchPID.iGain},${config.rollPitchPID.dGain},`);
    process.stdout.write(`yPID:${config.yawPID.pGain},${config.yawPID.iGain},${config.yawPID.dGain},`);
    process.stdout.write(`rpy:${errors.rollError},${errors.pitchError},${errors.yawError},`);
}