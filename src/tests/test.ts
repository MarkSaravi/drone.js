import TestRunner from './TestRunner';
import * as flightLogics from '../flight-logics';

const runner = new TestRunner();

runner.test('Hellow World passed', () => {
    TestRunner.assert(true, true);
});

runner.test('Hellow World failed', () => {
    TestRunner.assert(true, false);
});


console.log('testing...');