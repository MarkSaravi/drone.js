import ICalculatedPowers from '../models/ICalculatedPowers';

function GaussElimination(m: any) {
    const nRow = m.length;
    const nCol = m[0].length;

    for (let r = 0; r < nRow - 1; r++) {
        const K = m[r][r];
        for (let c = 0; c < nCol; c++) {
            m[r][c] = m[r][c] / K;
        }
        for (let i = r + 1; i < nCol - 1; i++) {
            const L = -m[i][r];
            for (let j = 0; j < nCol; j++) {
                m[i][j] = m[i][j] + L * m[r][j]
            }
        }
    }
}

function calcYs(m: any) {
    const nRow = m.length;
    const nCol = m[0].length;
    let y: any = [];
    for (let i = 0; i < nCol; i++) {
        y.push[0];
    }

    for (let r = nRow - 1; r >= 0; r--) {
        let sum = 0;
        for (let c = r + 1; c < nCol - 1; c++) {
            sum += y[c] * m[r][c];
        }
        y[r] = (m[r][nCol - 1] - sum) / m[r][r];
    }
    return y;
}

function calcJx(k1: number, k2: number, k3: number, k4: number, tr: number, tp: number, ty: number, wb: number) {
    function f1() {
        return (2 * wb * (k1 + k2 + k3 + k4) + k1 * k1 + k2 * k2 + k3 * k3 + k4 * k4);
    }

    function f2() {
        return (2 * wb * (k1 + k3 - k2 - k4) + k1 * k1 + k3 * k3 - k2 * k2 - k4 * k4 - ty);
    }

    function f3() {
        return (2 * wb * ( k1 -k3) - tp);
    }

    function f4() {
        return (2 * wb * ( k2 - k4) - tr);
    }

    // x1 * x1 + x2 * x2 + x3 * x3 + x4 * x4 - T  --------------------------------------------------
    function df1x1() {
        return 2 * wb + 2 * k1;
    }

    function df1x2() {
        return 2 * wb + 2 * k2;
    }

    function df1x3() {
        return 2 * wb + 2 * k3;
    }

    function df1x4() {
        return 2 * wb + 2 * k4;
    }

    // x2 * x2 - x4 * x4 + t2 --------------------------------------------------
    function df2x1() {
        return 2 * wb + 2 * k1;
    }

    function df2x2() {
        return 2 * wb + 2 * k3;
    }

    function df2x3() {
        return -2 * wb - 2 * k2;
    }

    function df2x4() {
        return -2 * wb - 2 * k4;
    }

    // x1 * x1 - x3 * x3 + t1 --------------------------------------------------
    function df3x1() {
        return 2 * wb;
    }

    function df3x2() {
        return 0;
    }

    function df3x3() {
        return -2 * wb;
    }

    function df3x4() {
        return 0;
    }

    // x1 * x1 - x2 * x2 + x3 * x3 - x4 * x4 + t3 --------------------------------------------------
    function df4x1() {
        return 0;
    }

    function df4x2() {
        return 2 * wb;
    }

    function df4x3() {
        return 0;
    }

    function df4x4() {
        return -2 * wb;
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


function torqueCalculator2(power: number, torqueRoll: number, torquePitch: number, torqueYaw: number): ICalculatedPowers {
    const wb = power;
    let x = [0, 0, 0, 0];

    for (let loop = 0; loop < 10; loop++) {
        let jx = calcJx(x[0], x[1], x[2], x[3], torqueRoll, torquePitch, torqueYaw, wb);
        GaussElimination(jx);
        let y = calcYs(jx);
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

export { torqueCalculator2 };