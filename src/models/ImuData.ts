export default class ImuData {
    constructor(
        readonly roll: number,
        readonly pitch: number,
        readonly yaw: number,
        readonly dt: number,
    ){
        
    }
}