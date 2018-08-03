"use strict";
exports.__esModule = true;
function RotateAroundZ(roll, pitch, a) {
    var nroll = Math.cos(a) * roll - Math.sin(a) * pitch;
    var npitch = Math.sin(a) * roll + Math.cos(a) * pitch;
    return [nroll, npitch];
}
exports.RotateAroundZ = RotateAroundZ;
