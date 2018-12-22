///<reference path="../../node_modules/@types/node/index.d.ts" />
import { EventEmitter } from 'events';
import PortInfo from '../models/PortInfo';
import ISerialDevice from '../devices/ISerialDevice';
import SerialDevice from '../devices/SerialDevice';
import FlightController from './FlightController';
import IFlightConfig from '../models/IFlightConfig';
import * as convertors from '../convertors';

export default class Application extends EventEmitter {
    imuDevice: ISerialDevice;
    escDevice: ISerialDevice;
    bleDevice: ISerialDevice;
    imuCounter: number = 0;

    devices: ISerialDevice[] = [];

    constructor(private readonly flightController: FlightController,
        private config: IFlightConfig) {
        super();
    }

    start() {
        this.registerEvents();
    }

    writeBLE(s: string): void {
    }

    onImuData(imuJson: string) {
        const imuData = convertors.JsonToImuData(
            imuJson, this.config.rollPolarity,
            this.config.pitchPolarity,
            this.config.yawPolarity);
        this.flightController.applyImuData(imuData);

        const escCommand = this.flightController.calcMotorsPower();
        this.escDevice.write(escCommand, () =>{
            console.log('Command sent...');
        });
    }

    onEscData(escString: string) {
    }

    onBleData(bleJson: string) {
        // {"x":0,"y":-3,"h":0,"p":42.5}
        console.log(bleJson);
        const cmd = convertors.JsonToCommand(bleJson);
        this.flightController.applyCommand(cmd);
    }

    registerEvents() {
        this.on('tilt-forward', () => {
            this.flightController.tiltForward();
        });

        this.on('tilt-backward', () => {
            this.flightController.tiltBackward();
        });

        this.on('tilt-right', () => {
            this.flightController.tiltRight();
        });

        this.on('tilt-left', () => {
            this.flightController.tiltLeft();
        });

        this.on('turn-right', () => {
            this.flightController.turnRight();
        });

        this.on('turn-left', () => {
            this.flightController.turnLeft();
        });

        this.on('inc-p-gain', () => {
            this.flightController.incPGain();
        });

        this.on('dec-p-gain', () => {
            this.flightController.decPGain();
        });

        this.on('inc-i-gain', () => {
            this.flightController.incIGain();
        });

        this.on('dec-i-gain', () => {
            this.flightController.decIGain();
        });

        this.on('inc-d-gain', () => {
            this.flightController.incDGain();
        });

        this.on('dec-d-gain', () => {
            this.flightController.decDGain();
        });

        this.on('inc-power', () => {
            this.flightController.incPower();
        });

        this.on('dec-power', () => {
            this.flightController.decPower();
        });

        this.on('toggle-p', () => {
            this.flightController.toggleP();
        });

        this.on('toggle-i', () => {
            this.flightController.toggleI();
        });

        this.on('toggle-d', () => {
            this.flightController.toggleD();
        });

        this.on('stopping-application', () => {
            const escCommand = this.flightController.stop();
            this.escDevice.write(escCommand, () => {
                console.log('Closing the ports...');
            });
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
            console.log('All ports are closed');
            process.exit(0);
        });

        this.on('start-application', (configs: PortInfo[]) => {
            this.imuDevice = this.openDevice('imu', configs, (s) => { this.onImuData(s); }, () => { console.log('IMU is connected'); });
            this.escDevice = this.openDevice('esc', configs, (s) => { this.onEscData(s); }, () => { console.log('ESC is connected'); });
            this.bleDevice = this.openDevice('ble', configs, (s) => { this.onBleData(s); }, () => { console.log('BLE is connected'); });
        });
    }

    openDevice(type: string, configs: PortInfo[],
        dataEventCallback: (data: string) => void,
        openEventCallback: () => void): SerialDevice {
        let config = configs.filter(d => d.type == type)[0];
        console.log(`Opening ${type}: ${JSON.stringify(config)}`);
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
