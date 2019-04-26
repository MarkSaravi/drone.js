export default class Command {
    constructor(
        readonly roll: number,
        readonly pitch: number,
        readonly yaw: number,
        readonly power: number,
        readonly state: number,
        readonly time: number
    ){
        
    }
}