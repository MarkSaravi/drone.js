///<reference path="../../node_modules/@types/node/index.d.ts" />
import { EventEmitter } from 'events';
const readline = require('readline');
import { IPortsConfig, IPortConfig } from '../models/PortConfig';
const portsConfig: IPortsConfig = require('config.json')('./config.ports.json');
const SerialPort = require('serialport');
import { println } from '../application/utilities';

export default class SerialDeviceReader extends EventEmitter {
    serial: any;
    deviceCounter: number = 0;

    constructor() {
        super();
    }

    startApp() {
        println('starting the application');
        this.registerConsoleCommands();
        this.openDevices();
        this.registerEvents();
    }

    initDevice(config: IPortConfig, event: string) {
        const Readline = SerialPort.parsers.Readline;
        const port = new SerialPort(config.name, { baudRate: config.baudRate, autoOpen: false });
        port.on('open', () => {
            this.deviceCounter++;
            println(`${config.type} is opened.`);
            port.flush();
        })
        port.on('close', () => {
            println(`${config.type} is closed.`);
            this.deviceCounter--;
            this.emit('exit-application');
        })
        port.open();
        const parser = new Readline()
        port.pipe(parser)
        parser.on('data', (str: string) => {
            println(str);
            this.emit(event, str);
        });
        return port;
    }

    openDevices() {
        println(`trying to open port ${process.env["PORT_NAME"]}`);
        switch (process.env["PORT_NAME"]) {
            case 'imu':
                this.serial = this.initDevice(portsConfig.imu, 'data-serial');
                break;
            case 'esc':
                this.serial = this.initDevice(portsConfig.esc, 'data-serial');
                break;
            case 'ble':
                this.serial = this.initDevice(portsConfig.ble, 'data-serial');
                break;
        }
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
            }
        });
        setInterval(() => {
            process.stdin.resume();
        }, 5);
        process.stdin.pause();
    }

    registerEvents() {
        this.on('data-serial', (data: string) => {
            this.onSerialData(data);
        });

        this.on('close-devices', () => {
            println('Closing devices.');
            this.serial.close();
        });

        this.on('exit-application', () => {
            if (this.deviceCounter != 0) {
                return;
            }
            println('exiting application');
            process.exit(0);
        });
    }

    onSerialData(data: string) {
        println(data)
    }
}
