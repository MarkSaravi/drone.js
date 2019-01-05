import IFlightStateError from './models/IFlightStateError';
import { IPIDValue } from './models/IPIDValue';
import IFlightConfig from './models/IFlightConfig';
import IPowers from './models/IPowers';
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
    if (rollPID) {
        print(`rPID:${numeral(rollPID.sum).format('+00.0')},${numeral(rollPID.p).format('+00.0')},${numeral(rollPID.i).format('+00.0')},,${numeral(rollPID.d).format('+00.0')},`);
    }
    if (pitchPID) {
        print(`pPID:${numeral(pitchPID.sum).format('+00.0')},${numeral(pitchPID.p).format('+00.0')},${numeral(pitchPID.i).format('+00.0')},,${numeral(pitchPID.d).format('+00.0')},`);
    }
    if (yawPID) {
        print(`yPID:${numeral(yawPID.sum).format('+00.0')},${numeral(yawPID.p).format('+00.0')},${numeral(yawPID.i).format('+00.0')},,${numeral(yawPID.d).format('+00.0')},`);
    }

}