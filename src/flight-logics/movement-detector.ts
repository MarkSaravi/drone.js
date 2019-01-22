export default class MovementDetector {
    private velocityX: number = 0;
    private velocityY: number = 0;
    private velocityZ: number = 0;
    private distX: number = 0;
    private distY: number = 0;
    private distZ: number = 0;

    constructor() {
    }

    getVelocity(accX: number, accY: number, accZ: number, dt: number): {
        velocityX: number;
        velocityY: number;
        velocityZ: number;
        distX: number;
        distY: number;
        distZ: number;
    } {
        const minSpeed = 60;
        this.velocityX += accX * dt;
        this.velocityY += accY * dt;
        this.velocityZ += 0; //accZ * dt;
        this.distX += Math.abs(this.velocityX) > minSpeed ? this.velocityX * dt : 0;
        this.distY += Math.abs(this.velocityY) > minSpeed ? this.velocityY * dt : 0;
        this.distZ += 0; //Math.abs(this.velocityZ) > minSpeed ? this.velocityZ * dt : 0;
        return {
            velocityX: this.velocityX,
            velocityY: this.velocityY,
            velocityZ: this.velocityZ,
            distX: this.distX,
            distY: this.distY,
            distZ: this.distZ,
        }
    }
}