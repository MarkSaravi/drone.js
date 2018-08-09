import TestRunner from './TestRunner';
import * as flightLogics from '../flight-logics';
import IPowerCompensations from '../models/IPowerCompensations';

const runner = new TestRunner();

runner.test('Hellow World passed', () => {
    TestRunner.assert(true, true);
});

runner.test('Hellow World failed', () => {
    TestRunner.assert(true, false);
});

runner.test('Same rpm when zero torque', () => {
    const tr = 0;
    const tp = 0;
    const ty = 0;
    const pb = 50;
    const expectedValue: IPowerCompensations = {
        p1: 50,
        p2: 50,
        p3: 50,
        p4: 50
    };
    const actualValues:IPowerCompensations = flightLogics.calcTorques(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}`);
    console.log(`p2: ${actualValues.p2}`);
    console.log(`p3: ${actualValues.p3}`);
    console.log(`p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        expectedValue.p1 === actualValues.p1 &&
        expectedValue.p2 === actualValues.p2 &&
        expectedValue.p3 === actualValues.p3 &&
        expectedValue.p4 === actualValues.p4
    );
});

console.log('testing...');