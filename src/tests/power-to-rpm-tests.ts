import TestRunner from './TestRunner';
import { BalanceFrontAndEnd } from '../convertors/power-to-rpm';

const runner = new TestRunner();

function testQuadratic(title: string, b: number, inc: number, expectedValue: number) {
    runner.test(title, () => {
        const actualValue = BalanceFrontAndEnd(b, inc, {M: 184, Y0: -2140});
        TestRunner.assert(expectedValue, actualValue.backPower);
    });
}

export default function tests() {
    console.log('front and back propller speed change');
    testQuadratic('front 200',50, 5, 54.41967627092627);
    testQuadratic('front 200',50, -5, 44.242209999510514);
}