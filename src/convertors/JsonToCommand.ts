import xyToRollPitch from '../flight-logics/xyToRollPitch';
import FlightState from '../models/FlightState';
import { Command } from '../models';

export default function (cmd: Command, target: FlightState): FlightState {
    const RATIO = 10;
    const tilt = xyToRollPitch(cmd.x, cmd.y);
    // console.log(JSON.stringify(tilt));
    return new FlightState(
        tilt.roll / RATIO,
        tilt.pitch / RATIO,
        target.yaw,
        0,
        cmd.power
    );
}