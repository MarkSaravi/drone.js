import IFlightStateError from '../models/IFlightStateError';
import { IPIDValue } from '../models/IPIDValue';
import IFlightConfig from '../models/IFlightConfig';
import IPowers from '../models/IPowers';
const numeral = require('numeral');

export function print(msg: string) {
    process.stdout.write(msg);
}

export function println(msg: string) {
    print(`${msg}\n`);
}

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
    print(`power:${numeral(power).format('0.00')},`);
    print(`rpPID:${numeral(config.rollPitchPID.pGain).format('0.000')},${numeral(config.rollPitchPID.iGain).format('0.000')},${numeral(config.rollPitchPID.dGain).format('0.000')},`);
    print(`yPID:${numeral(config.yawPID.pGain).format('0.000')},${numeral(config.yawPID.iGain).format('0.000')},${numeral(config.yawPID.dGain).format('0.000')},`);
    print(`rpy:${numeral(errors.rollError).format('+00.0')},${numeral(errors.pitchError).format('+00.0')},${numeral(errors.yawError).format('+00.0')},`);
}