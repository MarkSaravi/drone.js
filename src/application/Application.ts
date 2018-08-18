///<reference path="../../node_modules/@types/node/index.d.ts" />
import { EventEmitter } from 'events';
import PortInfo from '../models/PortInfo';
import ISerialDevice from '../devices/ISerialDevice';
import SerialDevice from '../devices/SerialDevice';
import FlightController from './FlightController';
import * as convertors from '../convertors';

export default class Application extends EventEmitter {
    imuDevice: ISerialDevice;
    escDevice: ISerialDevice;
    bleDevice: ISerialDevice;
    imuCounter: number = 0;

    devices: ISerialDevice[] = [];

    constructor(private readonly flightController: FlightController) {
        super();
    }

    start() {
        this.registerEvents();
    }

    writeBLE(s: string): void {
    }

    onImuData(imuJson: string) {
        const imuData = convertors.JsonToImuData(imuJson);
        this.flightController.applyImuData(imuData);

        const escCommand = this.flightController.calcMotorsPower();
        this.escDevice.write(escCommand);
    }

    onBleOpen() {
        console.log(`BLE is connected.`);
    }

    onBleData(bleJson: string) {
        console.log(bleJson);
        const cmd = convertors.JsonToCommand(bleJson);
        this.flightController.applyCommand(cmd);
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
            this.imuDevice = this.openDevice('imu', configs, (s) => { this.onImuData(s); }, () => {});
            this.escDevice = this.openDevice('esc', configs, (s) => { }, () => {});
            this.bleDevice = this.openDevice('ble', configs, (s) => { this.onBleData(s); }, () => { this.onBleOpen(); });
        });
    }

    openDevice(type: string, configs: PortInfo[],
        dataEventCallback: (data: string) => void,
        openEventCallback: () => void): SerialDevice {
        let config = configs.filter(d => d.type == type)[0];
        const device: SerialDevice = new SerialDevice(type, config.name, config.baudRate);
        device.open();
        device.registerOpenEvent(openEventCallback);
        device.registerCloseEvent(() => {
            this.emit('stop-application');
        });
        device.registerDataEvent(dataEventCallback);
        this.devices.push(device);
        return device;
    }
}
