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
            colorStdout.red(value);
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

export const printPIDConfig = (name: string, config: IPIDConfig) => {
    colorStdout.black(`${name}(`);
    colorStdout.red(`${config.usePGain ? 'P' : '_'}`);
    colorStdout.red(`${config.useIGain ? 'I' : '_'}`);
    colorStdout.red(`${config.useDGain ? 'D' : '_'}`);
    colorStdout.black('):');
    printLabelValue('pG:',`${numeral(config.pGain).format('0.000')} `, 'green');
    printLabelValue('iG:',`${numeral(config.iGain).format('0.000')} `, 'green');
    printLabelValue('dG:',`${numeral(config.dGain).format('0.000')} `, 'green');
}

export const printPIDValues = (pid: IPIDValue, dt: number) => {
    printLabelValue('sum:',`${numeral(pid.sum).format('+000.000')} `, 'green');
    printLabelValue('p:',`${numeral(pid.p).format('+000.000')} `, 'green');
    printLabelValue('i:',`${numeral(pid.i).format('+000.000')} `, 'green');
    printLabelValue('d:',`${numeral(pid.d).format('+000.000')} `, 'green');
    printLabelValue('t:',`${numeral(dt * 1000).format('000')} `, 'green');
}

export const printPowerValues = (cmd: string) => {
    const p = JSON.parse(cmd);
    printLabelValue('a:',`${numeral(p.a).format('00.0')} `, 'yellow');
    printLabelValue('b:',`${numeral(p.b).format('00.0')} `, 'yellow');
    printLabelValue('c:',`${numeral(p.c).format('00.0')} `, 'yellow');
    printLabelValue('d:',`${numeral(p.d).format('00.0')}\n`, 'yellow');
}

export const printEscCommand = (powers: IPowers) => {
    printLabelValue('a:',`${numeral(powers.a).format('00.0')} `, 'yellow');
    printLabelValue('b:',`${numeral(powers.b).format('00.0')} `, 'yellow');
    printLabelValue('c:',`${numeral(powers.c).format('00.0')} `, 'yellow');
    printLabelValue('d:',`${numeral(powers.d).format('00.0')}\n`, 'yellow');
}


function showError(label: string, err: number, iMinAngle: number, iMaxAngle: number) {
    if (Math.abs(err) < iMinAngle) {
        printLabelValue(`${label}:`, `${numeral(err).format('+00.000')} `, 'green');
    } else if (Math.abs(err) < iMaxAngle)  {
        printLabelValue(`${label}:`, `${numeral(err).format('+00.000')} `, 'yellow');
    } else {
        printLabelValue(`${label}:`, `${numeral(err).format('+00.000')} `, 'red');
    }
}
let counter: number = 0;

export default function showStatus(
    label: string,
    isRemoteSynced: boolean,
    power: number,
    rollPower: number,
    pitchPower: number,
    config: IFlightConfig,
    errors: IFlightStateError,
    rollPID: IPIDValue,
    pitchPID: IPIDValue,
    yawPID: IPIDValue,
    time: number,
    escCommand: IPowers
) {
    if (isRemoteSynced) {
        colorStdout.green(`${label} `);
    } else {
        colorStdout.red(`${label} `);
    }
    printLabelValue('pow:',`${numeral(power).format('0.00')} `, 'green');
    printLabelValue('rollPow:',`${numeral(rollPower).format('0.000')} `, 'green');
    printLabelValue('pitchPow:',`${numeral(pitchPower).format('0.000')} `, 'green');
    showError('roll', errors.rollError, config.rollPID.iMinAngle, config.rollPID.iMaxAngle);
    // printLabelValue('rOffs', `${numeral(config.rollOffset).format('+0.0')} `, 'green');
    showError('pitch', errors.pitchError, config.rollPID.iMinAngle, config.rollPID.iMaxAngle);
    // printLabelValue('pOffs', `${numeral(config.pitchOffset).format('+0.0')} `, 'green');
    printLabelValue('yaw:', `${numeral(errors.yawError).format('+00.000')} `, 'green');
    if (config.debug == 'roll') {
        printPIDConfig(config.debug, config.rollPID);
    }
    if (config.debug == 'pitch') {
        printPIDConfig(config.debug, config.pitchPID);
    }
    if (config.debug == 'yaw') {
        printPIDConfig(config.debug, config.yawPID);
    }
    if (rollPID && config.debug == 'roll') {
        printPIDValues(rollPID, time);
    }
    if (pitchPID && config.debug == 'pitch') {
        printPIDValues(pitchPID, time);
    }
    if (yawPID && config.debug == 'yaw') {
        printPIDValues(yawPID, time);
    }
    printEscCommand(escCommand);
}