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
import { IPowers } from '../models';
import { println, printPowerValues } from '../utilities';

const BLE_STOP_STATE = '{"state": "stop"}';
const ESC_STOP_COMMAND = '{"a":0.000,"b":0.000,"c":0.000,"d":0.000}';

export default class Application extends EventEmitter {
    imu: any;
    esc: any;
    ble: any;
    flightConfig: IFlightConfig;
    flightController: FlightController;
    lastCommandReceivedTime: number;
    terminated: boolean = false;
    time: Date = new Date();
    counter: number = 0;

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

    initDevice(config: IPortConfig, event: string, onOpen: () => void, onClose: () => void) {
        const Readline = SerialPort.parsers.Readline;
        const port = new SerialPort(config.name, { baudRate: config.baudRate, autoOpen: false });
        port.on('open', () => {
            println(`${config.type} is opened.`);
            port.flush();
            onOpen();
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
            () => {},
            () => { 
                this.ble.close();
            });
        this.esc = this.initDevice(portsConfig.esc, 'data-esc',
            () => {},
            () => {
                this.imu.close();
            });
        this.ble = this.initDevice(portsConfig.ble, 'data-ble',
            () => {
                this.lastCommandReceivedTime = (new Date()).getTime();
            },
            () => {
                println("exiting the application");
                process.exit(0);
            });
    }

    createEscCommand(p: IPowers): string {
        return `{"a":${numeral(p.a).format('0.000')},"b":${numeral(p.b).format('0.000')},"c":${numeral(p.c).format('0.000')},"d":${numeral(p.d).format('0.000')}}`
    }

    invalidateRemoteAync() {
        this.flightController.invalidateRemoteSync();
    }

    registerConsoleCommands() {
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);
        process.stdin.on('keypress', (str, key) => {
            switch (str) {
                case 'q':
                case 'Q':
                    this.invalidateRemoteAync();
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

                case 'r':
                case 'R':
                    this.emit('toggle-roll-pitch');
                    break;

                case 'y':
                case 'Y':
                    this.emit('reset-yaw');
                    break;
                case 'f':
                case 'F':
                    this.emit('inc-roll-offset');         
                    break;
                case 'g':
                case 'G':
                    this.emit('dec-roll-offset');
                    break;
                case 'h':
                case 'H':
                    this.emit('inc-pitch-offset');         
                    break;
                case 'j':
                case 'J':
                    this.emit('dec-pitch-offset');
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

        this.on('inc-p-gain', () => {
            this.flightController.incGain('p', true);
        });

        this.on('dec-p-gain', () => {
            this.flightController.incGain('p', false);
        });

        this.on('inc-i-gain', () => {
            this.flightController.incGain('i', true);
        });

        this.on('dec-i-gain', () => {
            this.flightController.incGain('i', false);
        });

        this.on('inc-d-gain', () => {
            this.flightController.incGain('d', true);
        });

        this.on('dec-d-gain', () => {
            this.flightController.incGain('d', false);
        });

        this.on('toggle-p', () => {
            this.flightController.toggleUseGain('p');
        });

        this.on('toggle-i', () => {
            this.flightController.toggleUseGain('i');
        });

        this.on('toggle-d', () => {
            this.flightController.toggleUseGain('d');
        });

        this.on('toggle-roll-pitch', () => {
            this.flightController.toggleRollPitchTuning();
        });

        this.on('inc-roll-offset', () => {
            this.flightController.incRollOffset();
        });

        this.on('dec-roll-offset', () => {
            this.flightController.decRollOffset();
        });

        this.on('inc-pitch-offset', () => {
            this.flightController.incPitchOffset();
        });

        this.on('dec-pitch-offset', () => {
            this.flightController.decPitchOffset();
        });

        this.on('reset-yaw', () => {
            this.flightController.resetYaw();
        });
    }

    writeBLE(s: string): void {
    }

    onImuData(imuJson: string) {
        const dt = this.time.getTime() - this.lastCommandReceivedTime;
        if (dt > 400) {
            console.log(`BLE data invalidation ${dt}`);
            this.flightController.invalidateRemoteSync();
        }
        const imuData = convertors.JsonToImuData(
            imuJson, this.flightConfig.rollPolarity,
            this.flightConfig.pitchPolarity,
            this.flightConfig.yawPolarity);

        if (!imuData) {
            return;
        }

        this.flightController.applyImuData(imuData);
        const powers = this.flightController.calcMotorsPower();
        const escCommand = !this.terminated?
            this.createEscCommand(powers) : ESC_STOP_COMMAND;
        this.esc.write(escCommand, () => {
            // printPowerValues(escCommand);
            this.counter = 0;
            if (this.terminated) {
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
        this.lastCommandReceivedTime = (new Date()).getTime();
        this.flightController.applyIncomingCommand(bleJson);
    }
}
