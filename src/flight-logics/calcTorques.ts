import IPowerCompensations from '../models/IPowerCompensations';

function calcTorques(basePower: number, tr: number, tp: number, ty: number): IPowerCompensations {
    const k1: number = -tp / 4 / basePower;
    const dp1: number = basePower + k1;
    const dp3: number = basePower - k1;
    const dp2: number = Math.sqrt((2 * dp1 * dp1 + ty - tr + tp) / 2);
    //const k2: number = dp2 - basePower;
    const dp4: number = Math.sqrt(dp2 * dp2 + tr);
    //console.log(`dPower: ${dp1}, ${dp2}, ${dp3}, ${dp4}`)
    return { p1:dp1, p2:dp2, p3:dp3, p4:dp4};
}

export default calcTorques;
