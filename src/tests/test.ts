import TestRunner from './TestRunner';
import * as flightLogics from '../flight-logics';
import IPowers from '../models/IPowers';

const runner = new TestRunner();
const powerBase = 5;
const mRpm = 140;
const bRpm = 100;

const eqSolver = (fx: (x: number) => number, initx: number): number => {
    let dx = 0.00001;
    const dfx = (x: number) => (fx(x + dx) - fx(x)) / dx;
    let x = initx;
    let loop = 0;
    do {
        x = x - fx(x) / dfx(x);
        //console.log(x);
        if (loop++ > 10) {
            console.log('\x1b[31m', 'no solution', '\x1b[0m');
            break;
        };
    } while (Math.abs(fx(x)) > dx);
    return x;
}

const fix = (x: number) => {
    return (x).toFixed(6);
}

const getMax = (v: number, p: IPowers) => {
    v = v < p.p1 ? p.p1 : v;
    v = v < p.p2 ? p.p2 : v;
    v = v < p.p3 ? p.p3 : v;
    v = v < p.p4 ? p.p4 : v;
    return v;
}

const getMin = (v: number, p: IPowers) => {
    v = v > p.p1 ? p.p1 : v;
    v = v > p.p2 ? p.p2 : v;
    v = v > p.p3 ? p.p3 : v;
    v = v > p.p4 ? p.p4 : v;
    return v;
}

runner.test('a', () => {
    const basePowers = [{
        power: 20,
        min: 20,
        max: 20,
    },
    {
        power: 30,
        min: 30,
        max: 30,
    }, {
        power: 40,
        min: 40,
        max: 40,
    }, {
        power: 50,
        min: 50,
        max: 50,
    }, {
        power: 60,
        min: 60,
        max: 60,
    }];
    const minTorque = -200, maxTorque = 200;
    const dT = 10;
    for (let i = 0; i < basePowers.length; i++) {
        const angularVelocity = flightLogics.powerToAngularVelocity(basePowers[i].power, mRpm, bRpm);
        for (let rollTorque = minTorque; rollTorque <= maxTorque; rollTorque += dT) {
            for (let pitchTorque = minTorque; pitchTorque <= maxTorque; pitchTorque += dT) {
                for (let yawTorque = minTorque; yawTorque <= maxTorque; yawTorque += dT) {
                    const adv = flightLogics.powerCalculator(angularVelocity, rollTorque, pitchTorque, yawTorque);
                    const nav = {
                        p1: angularVelocity + adv.p1,
                        p2: angularVelocity + adv.p2,
                        p3: angularVelocity + adv.p3,
                        p4: angularVelocity + adv.p4,
                    }
                    const nPower = {
                        p1: flightLogics.angularVelocityToPower(nav.p1, mRpm, bRpm),
                        p2: flightLogics.angularVelocityToPower(nav.p2, mRpm, bRpm),
                        p3: flightLogics.angularVelocityToPower(nav.p3, mRpm, bRpm),
                        p4: flightLogics.angularVelocityToPower(nav.p4, mRpm, bRpm),
                    }
                    basePowers[i].min = getMin(basePowers[i].min, nPower);
                    basePowers[i].max = getMax(basePowers[i].min, nPower);
                    //console.log('\x1b[32m', `power: ${fix(flightLogics.angularVelocityToPower(angularVelocity, mRpm, bRpm))}, p1: ${fix(nPower.p1)}, p2: ${fix(nPower.p2)}, p3: ${fix(nPower.p3)}, p4: ${fix(nPower.p4)},`, '\x1b[0m');
                }
            }
        }
    }

    for (let i = 0; i< basePowers.length; i++) {
        console.log('\x1b[32m', `power: ${fix(basePowers[i].power)}, min: ${fix(basePowers[i].min)}, max: ${fix(basePowers[i].max)}`, '\x1b[0m');
    }
});


// runner.test('zero torque', () => {
//     const tr = 0;
//     const tp = 0;
//     const ty = 0;
//     const pb = powerBase;
//     const dpb = 0;
//     const actualValues:IPowers = flightLogics.powerCalculator(pb, tr, tp, ty);
//     console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
//     TestRunner.assert(true, 
//         dpb === actualValues.p1 &&
//         dpb === actualValues.p2 &&
//         dpb === actualValues.p3 &&
//         dpb === actualValues.p4
//     );
// });

// runner.test('positive roll torque', () => {
//     const tr = 0.01;
//     const tp = 0;
//     const ty = 0;
//     const pb = powerBase;
//     const dpb = 0;

//     const actualValues:IPowers = flightLogics.powerCalculator(pb, tr, tp, ty);
//     console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
//     TestRunner.assert(true, 
//         dpb === actualValues.p1 &&
//         dpb > actualValues.p2 &&
//         dpb === actualValues.p3 &&
//         dpb < actualValues.p4
//     );
// });

// runner.test('negative roll torque', () => {
//     const tr = -0.1;
//     const tp = 0;
//     const ty = 0;
//     const pb = powerBase;
//     const dpb = 0;

//     const actualValues:IPowers = flightLogics.powerCalculator(pb, tr, tp, ty);
//     console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
//     TestRunner.assert(true, 
//         dpb === actualValues.p1 &&
//         dpb < actualValues.p2 &&
//         dpb === actualValues.p3 &&
//         dpb > actualValues.p4
//     );
// });

// runner.test('positive pitch torque', () => {
//     const tr = 0;
//     const tp = 0.1;
//     const ty = 0;
//     const pb = powerBase;
//     const dpb = 0;

//     const actualValues:IPowers = flightLogics.powerCalculator(pb, tr, tp, ty);
//     console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
//     TestRunner.assert(true, 
//         dpb > actualValues.p1 &&
//         dpb === Math.round(actualValues.p2) &&
//         dpb < actualValues.p3 &&
//         dpb === Math.round(actualValues.p4)
//     );
// });

// runner.test('negative pitch torque', () => {
//     const tr = 0;
//     const tp = -0.1;
//     const ty = 0;
//     const pb = powerBase;
//     const dpb = 0;

//     const actualValues:IPowers = flightLogics.powerCalculator(pb, tr, tp, ty);
//     console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
//     TestRunner.assert(true, 
//         dpb < actualValues.p1 &&
//         dpb === Math.round(actualValues.p2) &&
//         dpb > actualValues.p3 &&
//         dpb === Math.round(actualValues.p4)
//     );
// });

// runner.test('positive roll and pitch torque', () => {
//     const tr = 0.1;
//     const tp = 0.1;
//     const ty = 0;
//     const pb = powerBase;
//     const dpb = 0;

//     const actualValues:IPowers = flightLogics.powerCalculator(pb, tr, tp, ty);
//     console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
//     TestRunner.assert(true, 
//         dpb > actualValues.p1 &&
//         dpb > actualValues.p2 &&
//         dpb < actualValues.p3 &&
//         dpb < actualValues.p4
//     );
// });

// runner.test('negative roll and pitch torque', () => {
//     const tr = -0.1;
//     const tp = -0.1;
//     const ty = 0;
//     const pb = powerBase;
//     const dpb = 0;

//     const actualValues:IPowers = flightLogics.powerCalculator(pb, tr, tp, ty);
//     console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
//     TestRunner.assert(true, 
//         dpb < actualValues.p1 &&
//         dpb < actualValues.p2 &&
//         dpb > actualValues.p3 &&
//         dpb > actualValues.p4
//     );
// });

// runner.test('positive yaw torque', () => {
//     const tr = 0;
//     const tp = 0;
//     const ty = 0.1;
//     const pb = powerBase;
//     const dpb = 0;

//     const actualValues:IPowers = flightLogics.powerCalculator(pb, tr, tp, ty);
//     console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
//     TestRunner.assert(true, 
//         dpb < actualValues.p1 &&
//         dpb > actualValues.p2 &&
//         dpb < actualValues.p3 &&
//         dpb > actualValues.p4
//     );
// });

// runner.test('negative yaw torque', () => {
//     const tr = 0;
//     const tp = 0;
//     const ty = -0.1;
//     const pb = powerBase;
//     const dpb = 0;

//     const actualValues:IPowers = flightLogics.powerCalculator(pb, tr, tp, ty);
//     console.log(`p1: ${actualValues.p1}, p2: ${actualValues.p2}, p3: ${actualValues.p3}, p4: ${actualValues.p4}`);
//     TestRunner.assert(true, 
//         dpb > actualValues.p1 &&
//         dpb < actualValues.p2 &&
//         dpb > actualValues.p3 &&
//         dpb < actualValues.p4
//     );
// });

// runner.test('interpolation', () => {
//     let rpms = [{p: 20, rpm: 2660}, {p: 30, rpm:4150}, {p: 40, rpm:5550}, {p:45, rpm:6400}];
//     let xy = rpms.map((i) => ({x: i.p, y: i.rpm}));
//     let yx = rpms.map((i) => ({x: i.rpm, y: i.p}));
//     //let xy = [{x: 20, y: 2660}, {x: 30, y:4150}, {x: 40, y:5550}, {x:45, y:6400}];

//     TestRunner.assert(2660, flightLogics.interpolation(20, xy));
//     TestRunner.assert(4150, flightLogics.interpolation(30, xy));
//     TestRunner.assert(5550, flightLogics.interpolation(40, xy));
//     TestRunner.assert(6400, flightLogics.interpolation(45, xy));
//     TestRunner.assert(7448, flightLogics.interpolation(50, xy));

//     TestRunner.assert(20, flightLogics.interpolation(2660, yx));
//     TestRunner.assert(30, flightLogics.interpolation(4150, yx));
//     TestRunner.assert(40, flightLogics.interpolation(5550, yx));
//     TestRunner.assert(45, flightLogics.interpolation(6400, yx));
//     const xxx = flightLogics.interpolation(7448, yx);
//     console.log(xxx);
//     TestRunner.assert(50, flightLogics.interpolation(7448, yx));
// });

// runner.test('error smootthings', () => {
//     //const values = [1, 1.21, 1.3225+0.5, 1.44, 1.5625, 1.69];
//     const values = [1, 1.1, 1.2+0.2, 1.3, 1.4, 1.5];
//     let pv = values[0];
//     for (let v of values) {
//         const sv = flightLogics.noiseFilter(v, pv);
//         console.log(`org: ${v}, filtered: ${sv}`);
//         pv = sv;
//     }
//     TestRunner.assert(true, true);
// });