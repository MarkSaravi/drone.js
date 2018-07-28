///<reference path="../node_modules/@types/node/index.d.ts" />

import { EventEmitter } from 'events';
import PortInfo from './models/PortInfo';
export default class Application extends EventEmitter {
    devices: PortInfo[] = [];
    constructor() {
        super();
        this.on('stopping-application', () => {
        });

        this.on('stop-application', () => {
            process.exit(0);
        });

        this.on('devices-ready', (devices: PortInfo[]) => {
            this.devices = devices;
            for (let d of this.devices) {
                console.log(`${d.type}: ${d.name}, ${d.baudRate}`);
            }
        });

    }
}
