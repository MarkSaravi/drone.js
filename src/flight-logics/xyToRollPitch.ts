import { ITilt } from '../models/FlightState';
export default function(x: number,y: number): ITilt {
    const rotation = Math.PI / 4;
    const roundFactor = 100000;
    const roll = Math.round((x * Math.cos(rotation) + y * Math.sin(rotation)) * roundFactor) / roundFactor;
    const pitch =Math.round((-x * Math.sin(rotation) + y * Math.cos(rotation)) * roundFactor) / roundFactor;
    return {
        roll, pitch
    }
}