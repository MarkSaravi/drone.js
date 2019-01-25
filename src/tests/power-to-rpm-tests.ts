import TestRunner from './TestRunner';
import { quadratic } from '../convertors/power-to-rpm';

const runner = new TestRunner();

function testQuadratic(title: string, b: number, inc: number, expectedValue: number) {
    runner.test(title, () => {
        const actualValue = quadratic(b, inc)
        TestRunner.assert(expectedValue, actualValue);
    });
}

export default function tests() {
    console.log('front and back propller speed change');
    testQuadratic('front 200',6050, 200, -206.84160748658087);
    testQuadratic('front -200',6050, -200, 193.5967198402559);
}