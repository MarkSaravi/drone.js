function pad(x) {
    const f = x.toFixed(3);
    let s = f.toString();
    while (s.length < 8) {
        s = ' ' + s;
    }
    return s;
}

function showRowMatrix(m) {
    const nCol = m.length;
 
    let s = '';
        for (let c=0; c< nCol; c++){
            s = s+`${pad(m[c])}`;
        }
        return s;
}

function showMatrix(m) {
    const nRow = m.length;
    const nCol = m[0].length;
 
    for (let r = 0; r < nRow; r++) {
        let s = showRowMatrix(m[r], nCol);
        console.log(s)
    }
    console.log('                  ');
}

function GaussElimination(m) {
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

function calcYs(m) {
    const nRow = m.length;
    const nCol = m[0].length;
    let y = [];
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

function calcJx(x1, x2, x3, x4, tr, tp, ty, T) {
    function f1() {
        //return x1 * x1 + x2 * x2 + x3 * x3 + x4 * x4 - T;
        return 3*x1-Math.cos(x2*x3)-1/2;
    }

    function f2() {
        //return x2 * x2 - x4 * x4 + tp;
        return x1*x1-81*(x2+0.1)*(x2+0.1)+Math.sin(x3)+1.06;
    }

    function f3() {
        //return x1 * x1 - x3 * x3 + tr;
        return Math.exp(-x1*x2)+20*x3+(10*Math.PI-3)/3;
    }

    function f4() {
        return x1 * x1 - x2 * x2 + x3 * x3 - x4 * x4 + ty;
    }

    //--------------------------------------------------
    function df1x1() {
        //return 2 * x1;
        return 3;
    }

    function df1x2() {
        //return 2 * x2;
        return x3* Math.sin(x2*x3);
    }

    function df1x3() {
        //return 2 * x3;
        return x2*Math.sin(x2*x3);
    }

    function df1x4() {
        //return 2 * x4;
        return 0;
    }

    //--------------------------------------------------
    function df2x1() {
        //return 0;
        return 2*x1;
    }

    function df2x2() {
        //return 2 * x2;
        return -162*(x2+0.1);
    }

    function df2x3() {
        //return 0;
        return Math.cos(x3);
    }

    function df2x4() {
        //return -2 * x4;
        return 0;
    }

    //--------------------------------------------------
    function df3x1() {
        //return 2 * x1;
        return -x2* Math.exp(-x1*x2);
    }

    function df3x2() {
        //return 0;
        return -x1*Math.exp(-x1*x2);
    }

    function df3x3() {
        //return -2 * x3;
        return 20;
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
    // let jx = [
    //     [df1x1(), df1x2(), df1x3(), df1x4(), fx[0]],
    //     [df2x1(), df2x2(), df2x3(), df2x4(), fx[1]],
    //     [df3x1(), df3x2(), df3x3(), df3x4(), fx[2]],
    //     [df4x1(), df4x2(), df4x3(), df4x4(), fx[3]]
    // ];
    let jx = [
        [df1x1(), df1x2(), df1x3(), fx[0]],
        [df2x1(), df2x2(), df2x3(), fx[1]],
        [df3x1(), df3x2(), df3x3(), fx[2]]
    ];
    return jx;
}

// const wb = 2;
// const T = 4 * wb * wb;
// const tr = 2;
// const tp = 0;
// const ty = 0;
// let x = [wb, wb, wb, wb];

// for (let loop = 0; loop < 10; loop++) {
//     let y = calc(x[0], x[1], x[2], x[3], tr, tp, ty, T);
//     for (let i = 0; i < 4; i++) {
//         x[i] = x[i] + y[i];
//     }
//     showRowMatrix(x);
// }
//let matrix = [[1,3,-2,5],[3,5,6,7],[2,4,3,8]];
let matrix=[[3,2,-4,5,7],[-1,4,1,-2.5,1],[5,1,-1,3,14],[4,3,2,-1,16]];
showMatrix(matrix);
GaussElimination(matrix);
showMatrix(matrix);
let y = calcYs(matrix);
//console.log(showRowMatrix(y, 3));

let jx = calcJx(0.1,0.1,-0.1);
console.log(jx);