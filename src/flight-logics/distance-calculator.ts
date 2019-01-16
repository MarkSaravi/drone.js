interface IXYZ {
    x: number;
    y: number;
    z: number;
}

interface IAccleration extends IXYZ {
}

interface IVelocity extends IXYZ {
}

interface IDistanceVector extends IXYZ {
}

interface IDistance extends IXYZ {
}

interface IMotion {
    vel: IVelocity;
    dist: IDistance;
}

export default class DistanceCalculator {
    private real: IMotion;
    private world: IMotion;

    constructor() {
        this.reset(this.real);
        this.reset(this.world);
    }

    // calcVelocity(acc: number, dt: number, prevVel: number): number {
    //     return acc * dt + prevVel;
    // }

    private calcDistance(acc: number, dt: number, prevDist: number): number {
        return acc * dt * dt + prevDist;
    }

    private calcDistances(acc: IAccleration, dt: number, prevDist: IVelocity): IVelocity {
        return {
            x: this.calcDistance(acc.x, dt, prevDist.x),
            y: this.calcDistance(acc.y, dt, prevDist.y),
            z: this.calcDistance(acc.z, dt, prevDist.z),
        }
    }

    // calcVelocities(acc: IAccleration, dt: number, prevVel: IVelocity): IVelocity {
    //     return {
    //         x: this.calcVelocity(acc.x, dt, prevVel.x),
    //         y: this.calcVelocity(acc.y, dt, prevVel.y),
    //         z: this.calcVelocity(acc.z, dt, prevVel.z),
    //     }
    // }

    private reset(motion: IMotion) {
        this.real = {
            vel: {x: 0, y: 0, z: 0},
            dist: {x: 0, y: 0, z: 0},
        }
        this.world = {
            vel: {x: 0, y: 0, z: 0},
            dist: {x: 0, y: 0, z: 0},
        }
    }

    private distance(dist: IDistance): number {
        return Math.sqrt(dist.x * dist.x + dist.y * dist.y);
    }

    calc(
        realAcc: IAccleration, worldAcc: IAccleration, dt: number
    ): { real: IMotion, world: IMotion, realDist: number, worldDist: number } {
        this.real.dist = this.calcDistances(realAcc, dt, this.real.dist);
        this.world.dist = this.calcDistances(worldAcc, dt, this.world.dist);
        return {
            real: this.real,
            world: this.world,
            realDist: this.distance(this.real.dist),
            worldDist: this.distance(this.world.dist),
        }
    }
}