import Command from '../models/Command';

export default function(json: string): Command {
    let cmd = JSON.parse(json);
    return new Command(cmd.h, cmd.x, cmd.y, cmd.p);
}