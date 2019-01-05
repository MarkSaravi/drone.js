import IFlightStateError from './models/IFlightStateError';
import { IPIDValue } from './models/IPIDValue';
import IFlightConfig from './models/IFlightConfig';
import IPIDConfig from './models/IPIDConfig';
import { IPowers } from './models';
const numeral = require('numeral');
const colorStdout = require('color-stdout');

export function print(msg: string) {
    process.stdout.write(msg);
}

export function println(msg: string) {
    print(`${msg}\n`);
}

export function printLabelValue(label: string, value: string, color: string) {
    print(label);
    switch (color) {
        case 'red':
            colorStdout.green(value);
            break;
        case 'green':
            colorStdout.green(value);
            break;
        case 'blue':
            colorStdout.blue(value);
            break;
        case 'yellow':
            colorStdout.yellow(value);
            break;
        case 'white':
            colorStdout.blue(value);
            break;
        case 'black':
            colorStdout.yellow(value);
            break;
        default:
            print(value);
            break;
    }
}

export const printPIDConfig = (config: IPIDConfig) => {
    printLabelValue('pG:',`${numeral(config.pGain).format('0.000')} `, 'green');
    printLabelValue('iG:',`${numeral(config.iGain).format('0.000')} `, 'green');
    printLabelValue('dG:',`${numeral(config.dGain).format('0.000')} `, 'green');
}

export const printPIDValues = (pid: IPIDValue) => {
    printLabelValue('sum:',`${numeral(pid.sum).format('+000.000')} `, 'green');
    printLabelValue('p:',`${numeral(pid.p).format('+000.000')} `, 'green');
    printLabelValue('i:',`${numeral(pid.i).format('+000.000')} `, 'green');
    printLabelValue('d:',`${numeral(pid.d).format('+000.000')} `, 'green');
}

export const printPowerValues = (p: IPowers) => {
    printLabelValue('a:',`${numeral(p.a).format('+00.0')} `, 'yellow');
    printLabelValue('b:',`${numeral(p.b).format('+00.0')} `, 'yellow');
    printLabelValue('c:',`${numeral(p.c).format('+00.0')} `, 'yellow');
    printLabelValue('d:',`${numeral(p.d).format('+00.0')}\n`, 'yellow');
}

export default function showStatus(
    power: number,
    config: IFlightConfig,
    errors: IFlightStateError,
    rollPID: IPIDValue,
    pitchPID: IPIDValue,
    yawPID: IPIDValue

) {
    printLabelValue('power:',`${numeral(power).format('0.00')} `, 'green');
    printLabelValue('roll:', `${numeral(errors.rollError).format('+00.0')} `, 'green');
    printLabelValue('pitch:', `${numeral(errors.pitchError).format('+00.0')} `, 'green');
    printLabelValue('yaw:', `${numeral(errors.yawError).format('+00.0')} `, 'green');
    if (config.debug == 'roll' || config.debug == 'pitch') {
        printPIDConfig(config.rollPitchPID);
    }
    if (config.debug == 'yaw') {
        printPIDConfig(config.yawPID);
    }
    if (rollPID && config.debug == 'roll') {
        printPIDValues(rollPID);
    }
    if (pitchPID && config.debug == 'pitch') {
        printPIDValues(pitchPID);
    }
    if (yawPID && config.debug == 'yaw') {
        printPIDValues(yawPID);
    }
}