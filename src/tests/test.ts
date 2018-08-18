import TestRunner from './TestRunner';
import * as flightLogics from '../flight-logics';
import IPowerCompensations from '../models/IPowerCompensations';

const runner = new TestRunner();

runner.test('zero torque', () => {
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
    const actualValues:IPowerCompensations = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        expectedValue.p1 === actualValues.p1 &&
        expectedValue.p2 === actualValues.p2 &&
        expectedValue.p3 === actualValues.p3 &&
        expectedValue.p4 === actualValues.p4
    );
});

runner.test('positive roll torque', () => {
    const tr = 0.1;
    const tp = 0;
    const ty = 0;
    const pb = 50;

    const actualValues:IPowerCompensations = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        pb === actualValues.p1 &&
        pb > actualValues.p2 &&
        pb === actualValues.p3 &&
        pb < actualValues.p4
    );
});

runner.test('negative roll torque', () => {
    const tr = -0.1;
    const tp = 0;
    const ty = 0;
    const pb = 50;

    const actualValues:IPowerCompensations = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        pb === actualValues.p1 &&
        pb < actualValues.p2 &&
        pb === actualValues.p3 &&
        pb > actualValues.p4
    );
});

runner.test('positive pitch torque', () => {
    const tr = 0;
    const tp = 0.1;
    const ty = 0;
    const pb = 50;

    const actualValues:IPowerCompensations = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        pb > actualValues.p1 &&
        pb === Math.round(actualValues.p2) &&
        pb < actualValues.p3 &&
        pb === Math.round(actualValues.p4)
    );
});

runner.test('negative pitch torque', () => {
    const tr = 0;
    const tp = -0.1;
    const ty = 0;
    const pb = 50;

    const actualValues:IPowerCompensations = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        pb < actualValues.p1 &&
        pb === Math.round(actualValues.p2) &&
        pb > actualValues.p3 &&
        pb === Math.round(actualValues.p4)
    );
});

runner.test('positive roll and pitch torque', () => {
    const tr = 0.1;
    const tp = 0.1;
    const ty = 0;
    const pb = 50;

    const actualValues:IPowerCompensations = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        pb > actualValues.p1 &&
        pb > actualValues.p2 &&
        pb < actualValues.p3 &&
        pb < actualValues.p4
    );
});

runner.test('negative roll and pitch torque', () => {
    const tr = -0.1;
    const tp = -0.1;
    const ty = 0;
    const pb = 50;

    const actualValues:IPowerCompensations = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        pb < actualValues.p1 &&
        pb < actualValues.p2 &&
        pb > actualValues.p3 &&
        pb > actualValues.p4
    );
});

runner.test('positive yaw torque', () => {
    const tr = 0;
    const tp = 0;
    const ty = 0.1;
    const pb = 50;

    const actualValues:IPowerCompensations = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        pb > actualValues.p1 &&
        pb < actualValues.p2 &&
        pb > actualValues.p3 &&
        pb < actualValues.p4
    );
});

runner.test('negative yaw torque', () => {
    const tr = 0;
    const tp = 0;
    const ty = -0.1;
    const pb = 50;

    const actualValues:IPowerCompensations = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        pb < actualValues.p1 &&
        pb > actualValues.p2 &&
        pb < actualValues.p3 &&
        pb > actualValues.p4
    );
});
