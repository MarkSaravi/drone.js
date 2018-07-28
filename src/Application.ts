///<reference path="../node_modules/@types/node/index.d.ts" />
import { EventEmitter } from 'events';
import PortInfo from './models/PortInfo';
import ISerialDevice from './devices/ISerialDevice';
import SerialDevice from './devices/SerialDevice';

export default class Application extends EventEmitter {
    imuDevice: ISerialDevice;
    devices: ISerialDevice[]= [];

    constructor() {
        super();
    }

    start() {
        this.registerEvents();
    }

    onImuData(imuData: string) {
        let r = JSON.parse(imuData);
        console.log(`Roll: ${r.roll}, Pitch: ${r.pitch}, Yaw: ${r.yaw}, TimeInterval: ${r.dt}`);
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

        this.on('devices-ready', (configs: PortInfo[]) => {
            for (let c of configs) {
                console.log(`${c.type}: ${c.name}, ${c.baudRate}`);
            }
            this.imuDevice = this.openDevice('imu', configs, (s) => { this.onImuData(s); });
            this.devices.push(this.imuDevice);
        });
    }

    openDevice(type: string, configs: PortInfo[], dataEventCallback:(data: string) => void): SerialDevice {
        let config = configs.filter(d => d.type == type)[0];
        const device: SerialDevice = new SerialDevice(type, config.name, config.baudRate);
        device.open();
        device.registerCloseEvent('device-closed', () => {
            this.emit('stop-application');
        });
        device.registerDataEvent(dataEventCallback);
        return device;
    }
}
