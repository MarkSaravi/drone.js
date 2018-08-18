import IPowerCompensations from '../models/IPowerCompensations';

function GaussElimination(m: any) {
    const nRow = m.length;
    const nCol = m[0].length;

    for (let r = 0; r < nRow-1; r++) {
        const K = m[r][r];
        for (let c = 0; c < nCol; c++) {
            m[r][c] = m[r][c] / K;
        }
        for (let i = r + 1; i < nCol-1; i++) {
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
    for (let i=0; i< nCol; i++){
        y.push[0];
    }

    for (let r = nRow -1; r >= 0; r--) {
        let sum = 0;
        for (let c = r+1; c<nCol-1; c++) {
            sum += y[c] * m[r][c];
        }
        y[r] = (m[r][nCol-1] - sum) / m[r][r];
    }
    return y;
}

function calcJx(x1: number, x2: number, x3: number, x4: number, t1: number, t2: number, t3: number, T: number) {
    function f1() {
        return -(x1 * x1 + x2 * x2 + x3 * x3 + x4 * x4 - T);
    }

    function f2() {
        return -(x2 * x2 - x4 * x4 + t2);
    }

    function f3() {
        return -(x1 * x1 - x3 * x3 + t1);
    }

    function f4() {
        return -(x1 * x1 - x2 * x2 + x3 * x3 - x4 * x4 + t3);
    }

    // x1 * x1 + x2 * x2 + x3 * x3 + x4 * x4 - T  --------------------------------------------------
    function df1x1() {
        return 2 * x1;
    }

    function df1x2() {
        return 2 * x2;
    }

    function df1x3() {
        return 2 * x3;
    }

    function df1x4() {
        return 2 * x4;
    }

    // x2 * x2 - x4 * x4 + t2 --------------------------------------------------
    function df2x1() {
        return 0;
    }

    function df2x2() {
        return 2 * x2;
    }

    function df2x3() {
        return 0;
    }

    function df2x4() {
        return -2 * x4;
    }

    // x1 * x1 - x3 * x3 + t1 --------------------------------------------------
    function df3x1() {
        return 2 * x1;
    }

    function df3x2() {
        return 0;
    }

    function df3x3() {
        return -2 * x3;
    }

    function df3x4() {
        return 0;
    }

    // x1 * x1 - x2 * x2 + x3 * x3 - x4 * x4 + t3 --------------------------------------------------
    function df4x1() {
        return 2 * x1;
    }

    function df4x2() {
        return -2 * x2;
    }

    function df4x3() {
        return 2 * x3;
    }

    function df4x4() {
        return -2 * x4;
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


function torqueCalculator(power: number, torqueRoll: number, torquePitch: number, torqueYaw: number): IPowerCompensations {
    const wb = power;
    const Twb = 4 * wb * wb;
    const T1 = torquePitch;
    const T2 = torqueRoll;
    const T3 = torqueYaw;
    let x = [wb, wb, wb, wb];
    
    for (let loop = 0; loop<10; loop++) {
        let jx = calcJx(x[0],x[1],x[2], x[3], T1, T2, T3, Twb);
        GaussElimination(jx);
        let y = calcYs(jx);
        for (let i=0; i<y.length; i++) {
            x[i] = x[i] + y[i];
        }
    }
    
    return { p1: x[0], p2: x[1], p3: x[2], p4: x[3]};
}

export { torqueCalculator };