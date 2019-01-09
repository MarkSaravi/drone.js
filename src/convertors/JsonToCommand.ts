import Command from '../models/Command';
import FlightState from '../models/FlightState';

export default function (cmdJson: string, target: FlightState): FlightState {
    const RATIO = 20;
    try {
        let cmd = JSON.parse(cmdJson);
        if (cmd.p != undefined) {
            return new FlightState(
                target.roll,
                target.pitch,
                target.yaw,
                0,
                cmd.p
            );
        } else if (cmd.x != undefined) {
            return new FlightState(
                cmd.x / RATIO,
                target.pitch,
                target.yaw,
                0,
                target.power
            );
        } else if (cmd.y != undefined) {
            return new FlightState(
                target.roll,
                cmd.y / RATIO,
                target.yaw,
                0,
                target.power
            );
        } else if (cmd.h != undefined) {
            return new FlightState(
                target.roll,
                target.pitch,
                target.yaw,
                0,
                target.power
            );
        } else {
            return target;
        }
    } catch (err) {
        return target;
    }
}