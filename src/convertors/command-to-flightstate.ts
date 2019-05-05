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

const commandToFlightState = (cmdStr: string, flightState: IFlightState, currPower: number, config: IRemoteControlConfig): { target: IFlightState, power: number } => {
    const cmd = JSON.parse(cmdStr);
    try {
        console.log(cmdStr);
        const powerRange = config.maxPower - config.minPower;
        const dPower = cmd.power / config.maxInputPower * powerRange;
        const powerChangePercent = dPower / powerRange * 100;
        let power = cmd.p > 0 ? config.minPower + dPower : 0;
        const roll = cmd.r / config.maxInputRoll * config.maxRoll;
        const pitch = cmd.p / config.maxInputPitch * config.maxPitch;
        const yaw = cmd.y / config.maxInputYaw * config.maxYaw;
        if (currPower == 0 && powerChangePercent > 5) {
            power = 0;
        }
        const armData = rotateRollPitch(roll, pitch);
        return {
            target: {
                roll: armData.armRoll,
                pitch: armData.armPitch,
                yaw,
            },
            power
        }
    }
    catch (err) { 
        return {
            target: {
                roll: 0,
                pitch: 0,
                yaw: 0,
            },
            power: 0
        }
    }
}

export default commandToFlightState;