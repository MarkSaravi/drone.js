import IFlightState from "../models/IFlightState";
import { IRemoteControlConfig } from "../models/IFlightConfig";

const rotateRollPitch = (roll: number, pitch: number): { armRoll: number, armPitch: number } => {
    const rotation = Math.PI / 4;
    const roundFactor = 100000;
    const armRoll = Math.round((roll * Math.cos(rotation) + pitch * Math.sin(rotation)) * roundFactor) / roundFactor;
    const armPitch = Math.round((-roll * Math.sin(rotation) + pitch * Math.cos(rotation)) * roundFactor) / roundFactor;
    return {
        armRoll, armPitch
    }
}

const commandToFlightState = (cmdStr: string, targetFlightState: IFlightState, config: IRemoteControlConfig): { target: IFlightState, power: number, error: string } => {
    try {
        const cmd = JSON.parse(cmdStr);
        const powerRange = config.maxPower - config.minPower;
        const dPower = cmd.power / config.maxInputPower * powerRange;
        let power = cmd.power > 0 ? config.minPower + dPower : 0;
        const roll = cmd.roll / config.maxInputRoll * config.maxRoll;
        const pitch = cmd.pitch / config.maxInputPitch * config.maxPitch;
        const dYaw = cmd.yaw / config.maxInputYaw * config.maxYaw;
        const yaw = targetFlightState.yaw + dYaw;
        const armData = rotateRollPitch(roll, pitch);
        const target =  {
            target: {
                roll: armData.armRoll,
                pitch: armData.armPitch,
                yaw,
            },
            power,
            error: '',
        };
        return target;
    }
    catch (err) { 
        return {
            target: {
                roll: 0,
                pitch: 0,
                yaw: 0,
            },
            power: 0,
            error: err,
        }
    }
}

export default commandToFlightState;