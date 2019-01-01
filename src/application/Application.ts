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
import { fixNum } from '../common';
import { ImuData } from '../models';

export default class Application extends EventEmitter {
    imu: any;
    esc: any;
    ble: any;
    flightConfig: IFlightConfig;
    flightController: FlightController;
    motorsIdle: boolean = false;

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

    initDevice(config: IPortConfig, event: string, onClose: () => void) {
        const Readline = SerialPort.parsers.Readline;
        const port = new SerialPort(config.name, { baudRate: config.baudRate, autoOpen: false });
        port.on('open', () => {
            console.log(`${config.type} is opened.`);
            port.flush();
        })
        port.on('close', () => {
            console.log(`${config.type} is closed.`);
            onClose();
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
        this.imu = this.initDevice(portsConfig.imu, 'data-imu',
            () => { });
        this.esc = this.initDevice(portsConfig.esc, 'data-esc',
            () => {
                console.log("exiting the application");
                process.exit(0);
            });
        this.ble = this.initDevice(portsConfig.ble, 'data-ble', () => { });
    }

    terminateApplication(terminate: boolean) {
        this.motorsIdle = true;
        const escCommand = "{\"a\":0,\"b\":0,\"c\":0,\"d\":0}";
        this.esc.write(escCommand, () => {
            process.stdout.write(`Stopping all motors: ${escCommand}\n`);
            if (terminate) {
                this.esc.close();
            }
        });
        if (terminate) {
            this.imu.close();
            this.ble.write("{\"state\": \"exit\"}",()=>{
                this.ble.close();
            });
            
        } else {
            this.ble.write("{\"state\": \"stop\"}");
        }      
    }

    activateMotors(activate: boolean) {
        if (activate) {
            this.motorsIdle = false;
        } else {
            this.terminateApplication(false);
        }
    }

    registerConsoleCommands() {
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);
        process.stdin.on('keypress', (str, key) => {
            switch (str) {
                case 's':
                case 'S':
                    if (this.motorsIdle) {
                        console.log('Starting motors.');
                        this.activateMotors(true);
                    } else {
                        console.log('Stopping motors.');
                        this.activateMotors(false);
                    }
                    break;
                case 'q':
                case 'Q':
                    console.log('Closing devices.');
                    this.terminateApplication(true);
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
    }

    writeBLE(s: string): void {
    }

    applySafeTilt(imuData: ImuData): boolean {
        return Math.abs(imuData.roll) < 30 && Math.abs(imuData.roll) < 30;
    }

    onImuData(imuJson: string) {
        if (this.motorsIdle) {
            return;
        }
        const imuData = convertors.JsonToImuData(
            imuJson, this.flightConfig.rollPolarity,
            this.flightConfig.pitchPolarity,
            this.flightConfig.yawPolarity);
        // console.log(JSON.stringify(imuData));
        if (!imuData) {
            return;
        }

        if (!this.applySafeTilt(imuData)) {
            this.activateMotors(false);
            return;
        }

        this.flightController.applyImuData(imuData);

        const escCommand = this.flightController.calcMotorsPower();
        this.esc.write(escCommand, () => {
            // const ps = `a:${fixNum(escCommand.p1, 4)} b:${fixNum(escCommand.p2, 4)} c:${fixNum(powers.p3, 4)} d:${fixNum(powers.p4, 4)}`;
            process.stdout.write(`${escCommand}\n`);
        });
    }

    onEscData(escString: string) {
    }

    onBleData(bleJson: string) {
        // {"x":0,"y":-3,"h":0,"p":42.5}
        console.log(`Command: ${bleJson}`);
        this.flightController.applyIncomingCommand(bleJson);
    }
}
