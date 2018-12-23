///<reference path="../../node_modules/@types/node/index.d.ts" />
import { EventEmitter } from 'events';
const readline = require('readline');
import { IPortsConfig, IPortConfig } from '../models/PortConfig';
const flightConfig: IFlightConfig = require('config.json')('./config.flight.json');
const portsConfig: IPortsConfig = require('config.json')('./config.ports.json');
const SerialPort = require('serialport');
import FlightController from './FlightController';
import IFlightConfig from '../models/IFlightConfig';
import * as convertors from '../convertors';

export default class Application extends EventEmitter {
    imu: any;
    esc: any;
    ble: any;
    flightConfig: IFlightConfig;
    flightController: FlightController;
    deviceCounter: number = 0;

    constructor() {
        super();
        this.flightConfig = flightConfig;
        this.flightController = new FlightController(this.flightConfig);
    }

    startApp() {
        console.log('starting the application');
        this.registerConsoleCommands();
        this.openDevices();
        this.registerEvents();
    }

    initDevice(config: IPortConfig, event: string) {
        const Readline = SerialPort.parsers.Readline;
        const port = new SerialPort(config.name, { baudRate: config.baudRate, autoOpen: false });
        port.on('open', () => {
            this.deviceCounter++;
            console.log(`${config.type} is opened.`);
            port.flush();
        })
        port.on('close', () => {
            console.log(`${config.type} is closed.`);
            this.deviceCounter--;
            this.emit('exit-application');
        })
        port.open();
        const parser = new Readline()
        port.pipe(parser)
        parser.on('data', (str: string) => {
            this.emit(event, str);
        });
        return port;
    }

    openDevices() {
        console.log('trying to open port...');
        this.imu = this.initDevice(portsConfig.imu, 'data-imu');
        this.esc = this.initDevice(portsConfig.esc, 'data-esc');
        this.ble = this.initDevice(portsConfig.ble, 'data-ble');
    }

    registerConsoleCommands() {
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);
        process.stdin.on('keypress', (str, key) => {
            switch (str) {
                case 'q':
                case 'Q':
                    this.emit('close-devices');
                    break;
                case ']':
                    this.emit('inc-p-gain');
                    break;
                case '[':
                    this.emit('dec-p-gain');
                    break;

                case '\'':
                    this.emit('inc-i-gain');
                    break;
                case ';':
                    this.emit('dec-i-gain');
                    break;

                case 'l':
                case 'L':
                    this.emit('inc-d-gain');
                    break;
                case 'k':
                case 'K':
                    this.emit('dec-d-gain');
                    break;

                case 'a':
                case 'A':
                    this.emit('inc-power');
                    break;

                case 'z':
                case 'Z':
                    this.emit('dec-power');
                    break;

                case 'p':
                case 'P':
                    this.emit('toggle-p');
                    break;

                case 'i':
                case 'I':
                    this.emit('toggle-i');
                    break;

                case 'd':
                case 'D':
                    this.emit('toggle-d');
                    break;
            }
        });
        setInterval(() => {
            process.stdin.resume();
        }, 5);
        process.stdin.pause();
    }

    registerEvents() {
        this.on('data-imu', (data: string) => {
            this.onImuData(data);
        });

        this.on('data-esc', (data: string) => {
            this.onEscData(data);
        });

        this.on('data-ble', (data: string) => {
            this.onBleData(data);
        });

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

        this.on('imu-data', data => {
            console.log(`imu data: ${data}`);
        });

        this.on('close-devices', () => {
            console.log('Closing devices.');
            this.imu.close();
            this.esc.close();
            this.ble.close();
        });

        this.on('exit-application', () => {
            if (this.deviceCounter != 0) {
                return;
            }
            console.log('exiting application');
            process.exit(0);
        });
    }

    writeBLE(s: string): void {
    }

    onImuData(imuJson: string) {
        const imuData = convertors.JsonToImuData(
            imuJson, this.flightConfig.rollPolarity,
            this.flightConfig.pitchPolarity,
            this.flightConfig.yawPolarity);
        // console.log(JSON.stringify(imuData));
        this.flightController.applyImuData(imuData);

        const escCommand = this.flightController.calcMotorsPower();
        if (this.esc.isOpen) {
            this.esc.write(escCommand);
        }
    }

    onEscData(escString: string) {
    }

    onBleData(bleJson: string) {
        // {"x":0,"y":-3,"h":0,"p":42.5}
        // console.log(bleJson);
        // const cmd = convertors.JsonToCommand(bleJson);
        // this.flightController.applyCommand(cmd);
    }
}
