function pad(x) {
    const f = x.toFixed(3);
    let s = f.toString();
    while (s.length < 8) {
        s = ' ' + s;
    }
    return s;
}

function showMatrix(m) {
    for (let r = 0; r < 4; r++) {
        console.log(`${pad(m[r][0])}${pad(m[r][1])}${pad(m[r][2])}${pad(m[r][3])}`)
    }
}

function calc(x1, x2, x3, x4, tr, tp, ty, T) {
    function f1() {
        return x1 * x1 + x2 * x2 + x3 * x3 + x4 * x4 - T;
    }

    function f2() {
        return x2 * x2 - x4 * x4 + tp;
    }

    function f3() {
        return x1 * x1 - x3 * x3 + tr;
    }

    function f4() {
        return x1 * x1 - x2 * x2 + x3 * x3 - x4 * x4 + ty;
    }

    //--------------------------------------------------
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

    //--------------------------------------------------
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

    //--------------------------------------------------
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

    //--------------------------------------------------
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
        [df1x1(), df1x2(), df1x3(), df1x4()],
        [df2x1(), df2x2(), df2x3(), df2x4()],
        [df3x1(), df3x2(), df3x3(), df3x4()],
        [df4x1(), df4x2(), df4x3(), df4x4()]
    ];
    showMatrix(jx);
    console.log('                     ');
    for (let i = 0; i < 3; i++) {
        for (let j = i + 1; j < 4; j++) {
            const K = -jx[j][i] / jx[i][i];
            for (let c = 0; c < 4; c++) {
                jx[j][c] = K * jx[i][c] + jx[j][c];
            }
        }
    }
    showMatrix(jx);
}

calc(1, 1, 1, 1, 1, 1, 1, 1);