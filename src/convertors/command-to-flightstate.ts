import IFlightState from "../models/IFlightState";
import { IRemoteControlConfig } from "../models/IFlightConfig";

const rotateRollPitch= (roll: number,pitch: number): {armRoll: number, armPitch: number} => {
    const rotation = Math.PI / 4;
    const roundFactor = 100000;
    const armRoll = Math.round((roll * Math.cos(rotation) + pitch * Math.sin(rotation)) * roundFactor) / roundFactor;
    const armPitch =Math.round((-roll * Math.sin(rotation) + pitch * Math.cos(rotation)) * roundFactor) / roundFactor;
    return {
        armRoll, armPitch
    }
}

const commandToFlightState = (cmdStr: string, flightState: IFlightState, config: IRemoteControlConfig): IFlightState => {
    const cmd = JSON.parse(cmdStr);
    const powerRange = config.maxPower - config.minPower;
    const dPower = cmd.power / config.maxInputPower * powerRange;
    const powerChangePercent = dPower / powerRange * 100;
    let power = cmd.power > 0 ? config.minPower + dPower : 0;
    const roll = cmd.roll / config.maxInputRoll * config.maxRoll;
    const pitch = cmd.pitch / config.maxInputPitch * config.maxPitch;
    const yaw = cmd.yaw / config.maxInputYaw * config.maxYaw;
    if (flightState.power == 0 && powerChangePercent > 5) {
        power = 0;
    }
    const armData = rotateRollPitch(roll, pitch);
    return {
        power,
        roll: armData.armRoll,
        pitch: armData.armPitch,
        yaw,
        time: cmd.time
    }
}

export default commandToFlightState;