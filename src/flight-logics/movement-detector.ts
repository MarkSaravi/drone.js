
interface IMovement {
    prevAcc: number;
    currAcc: number;
    currVelocity: number;
    prevVelocity: number;
}
export default class MovementDetector {
    xMove: IMovement = { prevAcc: 0, prevVelocity:0, currAcc: 0, currVelocity: 0}
    yMove: IMovement = { prevAcc: 0, prevVelocity:0, currAcc: 0, currVelocity: 0}

    constructor() {
    }

    accNoiseFilter(acc: number, prevAcc: number) {
        const noiseFilter = 0.45;
        const roundFactor = 100;
        return noiseFilter * Math.round(acc / roundFactor) * roundFactor + (1-noiseFilter) * prevAcc;
    }

    getVelocity(acc: number, dt: number, movement: IMovement) {
        movement.currAcc =  this.accNoiseFilter(acc, movement.prevAcc);
        movement.currVelocity = (movement.currAcc - movement.prevAcc) * dt + movement.prevVelocity;
        movement.prevVelocity = movement.currVelocity;
        movement.prevAcc = movement.currAcc;
    }

    getVelocityX(accX: number, dt: number): IMovement {
        this.getVelocity(accX, dt, this.xMove);
        return this.xMove;
    }

    getVelocityY(accY: number, dt: number): IMovement {
        this.getVelocity(accY, dt, this.yMove);
        return this.yMove;
    }
}