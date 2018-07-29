///<reference path="../node_modules/@types/node/index.d.ts" />
import { EventEmitter } from 'events';
import PortInfo from './models/PortInfo';
import ISerialDevice from './devices/ISerialDevice';
import SerialDevice from './devices/SerialDevice';
import {RotateAroundZ} from './EulerTransforms';

export default class Application extends EventEmitter {
    imuDevice: ISerialDevice;
    escDevice: ISerialDevice;
    bleDevice: ISerialDevice;

    devices: ISerialDevice[] = [];

    constructor() {
        super();
    }

    start() {
        this.registerEvents();
    }

    onImuData(imuData: string) {
        let r = JSON.parse(imuData);
        let [nr, np] = RotateAroundZ(r.roll, r.pitch, Math.PI / 4);
        let rotations = {
            roll: nr,
            pitch: np,
            yaw: r.yaw
        };
        console.log(`${rotations.roll}, ${rotations.pitch}, ${rotations.yaw}`);
    }

    registerEvents() {
        this.on('stopping-application', () => {
            for (let d of this.devices) {
                d.close();
            }
        });

        this.on('stop-application', () => {
            for (let d of this.devices) {
                if (d.isOpen()) {
                    return;
                }
            }
            process.exit(0);
        });

        this.on('devices-ready', (configs: PortInfo[]) => {
            for (let c of configs) {
                console.log(`${c.type}: ${c.name}, ${c.baudRate}`);
            }
            this.imuDevice = this.openDevice('imu', configs, (s) => { this.onImuData(s); });
            this.escDevice = this.openDevice('esc', configs, (s) => { });
            this.bleDevice = this.openDevice('ble', configs, (s) => { });
        });
    }

    openDevice(type: string, configs: PortInfo[], dataEventCallback: (data: string) => void): SerialDevice {
        let config = configs.filter(d => d.type == type)[0];
        const device: SerialDevice = new SerialDevice(type, config.name, config.baudRate);
        device.open();
        device.registerCloseEvent('device-closed', () => {
            this.emit('stop-application');
        });
        device.registerDataEvent(dataEventCallback);
        this.devices.push(device);
        return device;
    }
}
