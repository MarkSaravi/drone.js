///<reference path="../node_modules/@types/node/index.d.ts" />
import { EventEmitter } from 'events';
import PortInfo from './models/PortInfo';
import ImuDevice from './devices/ImuDevice';
import SerialDevice from './devices/SerialDevice';

export default class Application extends EventEmitter {
    devices: PortInfo[] = [];
    imuDevice: ImuDevice;

    constructor() {
        super();
    }

    start() {
        this.registerEvents();
    }

    registerEvents() {
        this.on('stopping-application', () => {
            this.imuDevice.close();
        });

        this.on('stop-application', () => {
            if (this.imuDevice.isOpen()) {
                return;
            }
            process.exit(0);
        });

        this.on('devices-ready', (devices: PortInfo[]) => {
            this.devices = devices;
            for (let d of this.devices) {
                console.log(`${d.type}: ${d.name}, ${d.baudRate}`);
            }
            this.initDevices();
        });
    }

    initDevices() {
        this.imuDevice = this.openDevice('imu');
    }

    openDevice(type: string): SerialDevice {
        let config = this.devices.filter(d => d.type == type)[0];
        const device: SerialDevice = new SerialDevice(type, config.name, config.baudRate);
        device.open();
        device.on('device-closed', () => {
            this.emit('stop-application');
        });
        return device;
    }
}
