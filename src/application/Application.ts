///<reference path="../../node_modules/@types/node/index.d.ts" />
const numeral = require('numeral');
import { EventEmitter } from 'events';
const readline = require('readline');
import { IPortsConfig, IPortConfig } from '../models/PortConfig';
const flightConfig: IFlightConfig = require('config.json')('./config.flight.json');
const portsConfig: IPortsConfig = require('config.json')('./config.ports.json');
const SerialPort = require('serialport');
import FlightController from './FlightController';
import IFlightConfig from '../models/IFlightConfig';
import * as convertors from '../convertors';
import { ImuData, IPowers } from '../models';
import { println, printPowerValues } from '../utilities';

const BLE_STOP_STATE = '{"state": "stop"}';
const BLE_EXIT_STATE = '{"state": "exit"}';
const ESC_STOP_COMMAND = '{"a":0.000,"b":0.000,"c":0.000,"d":0.000}';

export default class Application extends EventEmitter {
    imu: any;
    esc: any;
    ble: any;
    flightConfig: IFlightConfig;
    flightController: FlightController;
    motorsIdle: boolean = false;
    terminated: boolean = false;
    imuIgnoreCounter: number = 0;

    constructor() {
        super();
        this.flightConfig = flightConfig;
        this.flightController = new FlightController(this.flightConfig);
    }

    startApp() {
        println('starting the application');
        this.registerConsoleCommands();
        this.openDevices();
        this.registerEvents();
    }

    initDevice(config: IPortConfig, event: string, onClose: () => void) {
        const Readline = SerialPort.parsers.Readline;
        const port = new SerialPort(config.name, { baudRate: config.baudRate, autoOpen: false });
        port.on('open', () => {
            println(`${config.type} is opened.`);
            port.flush();
        })
        port.on('close', () => {
            println(`${config.type} is closed.`);
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
        println('trying to open port...');
        this.imu = this.initDevice(portsConfig.imu, 'data-imu',
            () => { 
                this.ble.close();
            });
        this.esc = this.initDevice(portsConfig.esc, 'data-esc',
            () => {
                this.imu.close();
            });
        this.ble = this.initDevice(portsConfig.ble, 'data-ble',
            () => {
                println("exiting the application");
                process.exit(0);
            });
    }

    createEscCommand(p: IPowers): string {
        return `{"a":${numeral(p.a).format('0.000')},"b":${numeral(p.b).format('0.000')},"c":${numeral(p.c).format('0.000')},"d":${numeral(p.d).format('0.000')}}`
    }


    activateMotors(activate: boolean) {
        this.motorsIdle = !activate;
    }

    registerConsoleCommands() {
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);
        process.stdin.on('keypress', (str, key) => {
            switch (str) {
                case 's':
                case 'S':
                    if (this.motorsIdle) {
                        println('Starting motors.');
                        this.activateMotors(true);
                    } else {
                        println('Stopping motors.');
                        this.activateMotors(false);
                    }
                    break;
                case 'q':
                case 'Q':
                    this.motorsIdle = true;
                    this.terminated = true;
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
        if (this.imuIgnoreCounter < 200) {
            if (this.imuIgnoreCounter == 0) {
                console.log('Initialising IMU...');
            }
            this.imuIgnoreCounter++;
            return;
        }
        const imuData = convertors.JsonToImuData(
            imuJson, this.flightConfig.rollPolarity,
            this.flightConfig.pitchPolarity,
            this.flightConfig.yawPolarity);

        if (!imuData) {
            return;
        }

        if (Math.abs(imuData.roll) > this.flightConfig.maxAngle ||
            Math.abs(imuData.pitch) > this.flightConfig.maxAngle) {
            this.motorsIdle = true;
            this.terminated = true;
        }

        if (!this.applySafeTilt(imuData)) {
            this.activateMotors(false);
            return;
        }

        this.flightController.applyImuData(imuData);
        const powers = this.flightController.calcMotorsPower();
        const escCommand = !this.motorsIdle ?
            this.createEscCommand(powers) : ESC_STOP_COMMAND;
        this.esc.write(escCommand, () => {
            printPowerValues(escCommand);
            if (this.terminated && escCommand == ESC_STOP_COMMAND) {
                this.esc.close();
                this.imu.close();
                this.ble.close();
            }
        });
    }

    onEscData(escJson: string) {
        if (escJson.indexOf("{\"info\":\"end arming\"}") == 0) {
            this.ble.write(BLE_STOP_STATE);
        }
    }

    onBleData(bleJson: string) {
        // {"x":0,"y":-3,"h":0,"p":42.5}
        this.flightController.applyIncomingCommand(bleJson);
    }
}
