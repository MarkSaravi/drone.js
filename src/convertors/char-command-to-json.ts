const charToRollPitchYaw = (s: string, index: number): number => {
    return ((s.charCodeAt(index) - 50) / 10) - 2.5;
}

const charToPower = (s: string, index: number): number => {
    return ((s.charCodeAt(index) - 50) / 10);
}

export const charCommandToJson = (cmd: string) : string => {
    const roll = charToRollPitchYaw(cmd, 0);
    const pitch = charToRollPitchYaw(cmd, 1);
    const yaw = charToRollPitchYaw(cmd, 2);
    const power = charToPower(cmd, 3);
    const status = cmd[4];
    return `{\"roll\":${roll},\"pitch\":${pitch},\"yaw\":${yaw},\"power\":${power},\"status\":${status}}`;
}