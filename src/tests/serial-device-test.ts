///<reference path="../../node_modules/@types/node/index.d.ts" />
import { EventEmitter } from 'events';
const readline = require('readline');
import { IPortsConfig, IPortConfig } from '../models/PortConfig';
const portsConfig: IPortsConfig = require('config.json')('./config.ports.json');
const SerialPort = require('serialport');

export default class SerialDeviceReader extends EventEmitter {
    serial: any;
    deviceCounter: number = 0;

    constructor() {
        super();
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
            console.log(str);
            this.emit(event, str);
        });
        return port;
    }

    openDevices() {
        console.log('trying to open port...');
        this.serial = this.initDevice(portsConfig.imu, 'data-serial');
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
            console.log('Closing devices.');
            this.serial.close();
        });

        this.on('exit-application', () => {
            if (this.deviceCounter != 0) {
                return;
            }
            console.log('exiting application');
            process.exit(0);
        });
    }

    onSerialData(data: string) {
        console.log(data)
    }
}
