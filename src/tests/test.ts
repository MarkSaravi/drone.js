import TestRunner from './TestRunner';
import * as flightLogics from '../flight-logics';
import ICalculatedPowers from '../models/ICalculatedPowers';

const runner = new TestRunner();
const powerBase = 5;

runner.test('zero torque', () => {
    const tr = 0;
    const tp = 0;
    const ty = 0;
    const pb = powerBase;
    const dpb = 0;
    const actualValues:ICalculatedPowers = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        dpb === actualValues.p1 &&
        dpb === actualValues.p2 &&
        dpb === actualValues.p3 &&
        dpb === actualValues.p4
    );
});

runner.test('positive roll torque', () => {
    const tr = 0.01;
    const tp = 0;
    const ty = 0;
    const pb = powerBase;
    const dpb = 0;

    const actualValues:ICalculatedPowers = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        dpb === actualValues.p1 &&
        dpb > actualValues.p2 &&
        dpb === actualValues.p3 &&
        dpb < actualValues.p4
    );
});

runner.test('negative roll torque', () => {
    const tr = -0.1;
    const tp = 0;
    const ty = 0;
    const pb = powerBase;
    const dpb = 0;

    const actualValues:ICalculatedPowers = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        dpb === actualValues.p1 &&
        dpb < actualValues.p2 &&
        dpb === actualValues.p3 &&
        dpb > actualValues.p4
    );
});

runner.test('positive pitch torque', () => {
    const tr = 0;
    const tp = 0.1;
    const ty = 0;
    const pb = powerBase;
    const dpb = 0;

    const actualValues:ICalculatedPowers = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        dpb > actualValues.p1 &&
        dpb === Math.round(actualValues.p2) &&
        dpb < actualValues.p3 &&
        dpb === Math.round(actualValues.p4)
    );
});

runner.test('negative pitch torque', () => {
    const tr = 0;
    const tp = -0.1;
    const ty = 0;
    const pb = powerBase;
    const dpb = 0;

    const actualValues:ICalculatedPowers = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        dpb < actualValues.p1 &&
        dpb === Math.round(actualValues.p2) &&
        dpb > actualValues.p3 &&
        dpb === Math.round(actualValues.p4)
    );
});

runner.test('positive roll and pitch torque', () => {
    const tr = 0.1;
    const tp = 0.1;
    const ty = 0;
    const pb = powerBase;
    const dpb = 0;

    const actualValues:ICalculatedPowers = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        dpb > actualValues.p1 &&
        dpb > actualValues.p2 &&
        dpb < actualValues.p3 &&
        dpb < actualValues.p4
    );
});

runner.test('negative roll and pitch torque', () => {
    const tr = -0.1;
    const tp = -0.1;
    const ty = 0;
    const pb = powerBase;
    const dpb = 0;

    const actualValues:ICalculatedPowers = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        dpb < actualValues.p1 &&
        dpb < actualValues.p2 &&
        dpb > actualValues.p3 &&
        dpb > actualValues.p4
    );
});

runner.test('positive yaw torque', () => {
    const tr = 0;
    const tp = 0;
    const ty = 0.1;
    const pb = powerBase;
    const dpb = 0;

    const actualValues:ICalculatedPowers = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        dpb < actualValues.p1 &&
        dpb > actualValues.p2 &&
        dpb < actualValues.p3 &&
        dpb > actualValues.p4
    );
});

runner.test('negative yaw torque', () => {
    const tr = 0;
    const tp = 0;
    const ty = -0.1;
    const pb = powerBase;
    const dpb = 0;

    const actualValues:ICalculatedPowers = flightLogics.torqueCalculator(pb, tr, tp, ty);
    console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
    TestRunner.assert(true, 
        dpb > actualValues.p1 &&
        dpb < actualValues.p2 &&
        dpb > actualValues.p3 &&
        dpb < actualValues.p4
    );
});

runner.test('interpolation', () => {
    let xy = [{x: 20, y: 2660}, {x: 30, y:4150}, {x: 40, y:5550}, {x:45, y:6400}];

    TestRunner.assert(2660, flightLogics.interpolation(20, xy));
    TestRunner.assert(4150, flightLogics.interpolation(30, xy));
    TestRunner.assert(5550, flightLogics.interpolation(40, xy));
    TestRunner.assert(6400, flightLogics.interpolation(45, xy));
    TestRunner.assert(7448, flightLogics.interpolation(50, xy));
});