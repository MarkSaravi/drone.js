import { ITilt } from '../models/FlightState';
export default function(x: number,y: number): ITilt {
    const tiltFactor = 1;
    const rotation = Math.PI / 4;
    const roundFactor = 100000;
    const roll = Math.round((x * Math.cos(rotation) + y * Math.sin(rotation)) * tiltFactor * roundFactor) / roundFactor;
    const pitch =Math.round((-x * Math.sin(rotation) + y * Math.cos(rotation)) * tiltFactor * roundFactor) / roundFactor;
    return {
        roll, pitch
    }
}