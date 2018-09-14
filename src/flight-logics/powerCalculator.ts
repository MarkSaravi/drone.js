import ICalculatedPowers from '../models/ICalculatedPowers';
let gauss = require('gaussian-elimination');

function calcJx(a: number, b: number, c: number, d: number, tr: number, tp: number, ty: number, wb: number) {
    function f1() {
        return -(2 * wb * (a + b + c + d) + a * a + b * b + c * c + d * d);
    }

    function f2() {
        return -(2 * wb * (a - b + c - d) + a * a + c * c - b * b - d * d - ty);
    }

    function f3() {
        return (2 * wb * ( b -d) - tr);
    }

    function f4() {
        return (2 * wb * ( a - c) - tp);
    }

    // x1 * x1 + x2 * x2 + x3 * x3 + x4 * x4 - T  --------------------------------------------------
    function df1x1() {
        return 2 * (wb + a);
    }

    function df1x2() {
        return 2 * (wb + b);
    }

    function df1x3() {
        return 2 * (wb + c);
    }

    function df1x4() {
        return 2 * (wb + d);
    }

    // x2 * x2 - x4 * x4 + t2 --------------------------------------------------
    function df2x1() {
        return 2 * (wb + a);
    }

    function df2x2() {
        return -2 * (wb + b);
    }

    function df2x3() {
        return 2 * (wb + c);
    }

    function df2x4() {
        return -2 * (wb + d);
    }

    // x1 * x1 - x3 * x3 + t1 --------------------------------------------------
    function df3x1() {
        return 0;
    }

    function df3x2() {
        return 2 * (wb + b);
    }

    function df3x3() {
        return 0;
    }

    function df3x4() {
        return -2*(wb + d);
    }

    // x1 * x1 - x2 * x2 + x3 * x3 - x4 * x4 + t3 --------------------------------------------------
    function df4x1() {
        return 2 * (wb + a);
    }

    function df4x2() {
        return 0;
    }

    function df4x3() {
        return -2 * (wb + c);
    }

    function df4x4() {
        return 0;
    }

    let fx = [f1(), f2(), f3(), f4()];
    let jx = [
        [df1x1(), df1x2(), df1x3(), df1x4(), f1()],
        [df2x1(), df2x2(), df2x3(), df2x4(), f2()],
        [df3x1(), df3x2(), df3x3(), df3x4(), f3()],
        [df4x1(), df4x2(), df4x3(), df4x4(), f4()]
    ];
    return jx;
}

function powerCalculator(powerBase: number, torqueRoll: number, torquePitch: number, torqueYaw: number): ICalculatedPowers {
    if (powerBase<=0) {
        return {
            p1: 0, p2: 0, p3: 0, p4: 0
        }
    }
    let x = [0, 0, 0, 0];

    for (let loop = 0; loop < 10; loop++) {
        let jx = calcJx(x[0], x[1], x[2], x[3], torqueRoll, torquePitch, torqueYaw, powerBase);
        let y = gauss(jx);
        for (let i = 0; i < y.length; i++) {
            x[i] = x[i] + y[i];
        }
    }

    return {
        p1: x[0],
        p2: x[1],
        p3: x[2],
        p4: x[3]
    };
}

export default powerCalculator;