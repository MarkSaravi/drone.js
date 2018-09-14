import Command from '../models/Command';

export default function(json: string): Command {
    let cmd = JSON.parse(json);
    return new Command(0, 0, 0, cmd.p);
}