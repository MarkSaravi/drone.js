import IFlightStateError from './models/IFlightStateError';
import { IPIDValue } from './models/IPIDValue';
import IFlightConfig from './models/IFlightConfig';
import IPowers from './models/IPowers';
import IPIDConfig from './models/IPIDConfig';
const numeral = require('numeral');

export function print(msg: string) {
    process.stdout.write(msg);
}

export function println(msg: string) {
    print(`${msg}\n`);
}

const pidConfigToString = (config: IPIDConfig): string => 
     `pG:${numeral(config.pGain).format('0.000')} iG${numeral(config.iGain).format('0.000')} dG${numeral(config.dGain).format('0.000')}   `;

const pidValuesToString = (pid: IPIDValue): string =>
    `sum:${numeral(pid.sum).format('+000.0')} p:${numeral(pid.p).format('+000.0')} i:${numeral(pid.i).format('+000.0')} d:${numeral(pid.d).format('+000.0')}   `;

export default function showStatus(
    power: number,
    config: IFlightConfig,
    errors: IFlightStateError,
    rollPID: IPIDValue,
    pitchPID: IPIDValue,
    yawPID: IPIDValue

    ) 
{
    print(`power:${numeral(power).format('0.00')}   `);
    print(`   roll:${numeral(errors.rollError).format('+00.0')} pitch:${numeral(errors.pitchError).format('+00.0')} yaw:${numeral(errors.yawError).format('+000.0')}   `);
    if (config.debug == 'roll' || config.debug == 'pitch') {
        print(pidConfigToString(config.rollPitchPID));
    }
    if (config.debug == 'yaw') {
        print(pidConfigToString(config.yawPID));
    }
    if (rollPID && config.debug == 'roll') {
        print(pidValuesToString(rollPID));
    }
    if (pitchPID && config.debug == 'pitch') {
        print(pidValuesToString(pitchPID));
    }
    if (yawPID && config.debug == 'yaw') {
        print(pidValuesToString(yawPID));
    }

}