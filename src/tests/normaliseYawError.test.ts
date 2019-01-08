import TestRunner from './TestRunner';
import { normaliseYawError } from '../flight-logics/getStateErrors';

const runner = new TestRunner();

function test(title: string, currYaw: number, destYaw: number, expectedYawError: number) {
    runner.test(title, () => {
        const actualYawError = normaliseYawError(currYaw, destYaw);
        TestRunner.assert(expectedYawError, actualYawError);
    });
    }

export default function tests() {
    console.log('**** normaliseYawError tests ****');
    test('From 30 to 60 shoud be +30', 30, 60, 30);
    test('From 60 to 30 shoud be -30', 60, 30, -30);
    test('From 5 to -5 shoud be -10', 5, -5, -10);
    test('From -5 to 5 shoud be +10', -5, 5, 10);
    test('From 175 to -175 shoud be 10', 175, -175, 10);
    test('From -175 to 175 shoud be -10', -175, 175, -10);
    test('From 90 to -90 shoud be 180', 90, -90, -180);
    test('From -90 to 90 shoud be -180', -90, 90, 180);
    test('From 89 to -90 shoud be -179', 89, -90, -179);
    test('From 91 to -90 shoud be 179', 91, -90, 179);
}