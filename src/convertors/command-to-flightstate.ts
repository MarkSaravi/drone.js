import { IFlightState } from "../models/FlightState";
import { IRemoteControlConfig } from "../models/IFlightConfig";

const commandToFlightState = (cmdStr: string, flightState: IFlightState, config: IRemoteControlConfig): IFlightState => {
    const cmd = JSON.parse(cmdStr);
    const powerRange = config.maxPower - config.minPower;
    const dPower = cmd.power / config.maxInputPower * powerRange;
    const powerChangePercent = dPower / powerRange * 100;
    let power = cmd.power > 0 ? config.minPower + dPower : 0;
    const roll = cmd.roll / config.maxInputRoll * config.maxRoll;
    const pitch = cmd.pitch / config.maxInputPitch * config.maxPitch;
    const yaw = cmd.yaw / config.maxInputYaw * config.maxYaw;
    if (flightState.power == 0 && dPower / powerChangePercent > 5) {
        power = 0;
    }
    return {
        power,
        roll,
        pitch,
        yaw,
        time: cmd.time
    }
}

export default commandToFlightState;