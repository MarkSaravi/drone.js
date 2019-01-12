import TestRunner from './TestRunner';
import xyToRollPitch from '../flight-logics/xyToRollPitch';

const runner = new TestRunner();

function testRoll(title: string, x: number, y: number, expectedRoll: number) {
    runner.test(title, () => {
        const actualValue = xyToRollPitch(x, y);
        TestRunner.assert(expectedRoll, actualValue.roll);
    });
}

function testPitch(title: string, x: number, y: number, expectedPitch: number) {
    runner.test(title, () => {
        const actualValue = xyToRollPitch(x, y);
        TestRunner.assert(expectedPitch, actualValue.pitch);
    });
}

export default function tests() {
    console.log('**** normaliseYawError tests ****');
    testRoll('x: 0, y: 10 => roll: 7.07107', 0, 10, 7.07107);
    testPitch('x: 0, y: 10 => pitch: 7.07107', 0, 10, 7.07107);
    testRoll('x: 10, y: 0 => roll: 7.07107', 10, 0, 7.07107);
    testPitch('x: 10, y: 0 => pitch: -7.07107', 10, 0, -7.07107);
    testRoll('x: 0, y: -10 => roll: -7.07107', 0, -10, -7.07107);
    testPitch('x: 0, y: -10 => pitch: -7.07107', 0, -10, -7.07107);
    testRoll('x: -10, y: 0 => roll: 7.07107', -10, 0, -7.07107);
    testPitch('x: -10, y: 0 => pitch: 7.07107', -10, 0, 7.07107);
    testRoll('x: 7.07107, y: 7.07107 => roll: 10', 7.07107, 7.07107, 10);
    testPitch('x: 7.07107, y: 7.07107 => pitch: 0', 7.07107, 7.07107, 0);
}