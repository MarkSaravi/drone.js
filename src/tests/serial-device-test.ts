///<reference path="../../node_modules/@types/node/index.d.ts" />
import { EventEmitter } from 'events';
const readline = require('readline');
import { IPortsConfig, IPortConfig } from '../models/PortConfig';
const portsConfig: IPortsConfig = require('config.json')('./config.ports.json');
const SerialPort = require('serialport');
import { println } from '../utilities';
import DistanceCalculator from '../flight-logics/distance-calculator';
const numeral = require('numeral');
const colorStdout = require('color-stdout');

const distanceCalculator = new DistanceCalculator();

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

    trim(value: string, len: number = 10) {
        while (value.length < len) {
            value = ' ' + value;
        }
        return value;
    }

    prevTime: number = 0;
    prevAccX: number = 0;
    prevRawAccX: number = 0;
    prevAccY: number = 0;
    prevVelX: number = 0;
    prevVelY: number = 0;

    onSerialData(jsonString: string) {
        const noiseReducer = (v: number, pv: number) => {
            const noiseFactor = 0.45;
            return noiseFactor * v + (1 - noiseFactor) * pv;
        }

        // {"r":-1.615,"p":-2.014,"y":-92.374,"arx":7.000,"ary":0.000,"arz":111.000,"awx":3.000,"awy":4.000,"awz":111.000,"t":9883798}
        try {
            const data = JSON.parse(jsonString);
            const dt = 0.015;
            const noiseFilter = 0.45;
            const roundFactor = 100;

            const rawAccX = noiseFilter * Math.round(data.awx / roundFactor) * roundFactor + (1-noiseFilter) * this.prevAccX;
            const accX = rawAccX - this.prevAccX;
            const accY = data.awy - this.prevAccY;


            const velX = accX * dt + this.prevVelX;
            const velY = accY * dt + this.prevVelY;

            this.prevAccX = rawAccX;
            this.prevAccY = accY;
            this.prevVelX = velX;
            this.prevVelY = velY;

            colorStdout.blue(`${this.trim(numeral(data.awx).format('0'))},`);
            colorStdout.green(`${this.trim(numeral(accX).format('0'))},`);
            colorStdout.yellow(`${this.trim(numeral(velX).format('0'))}, `);
            colorStdout.blue(`${this.trim(numeral(data.awy).format('0'))},`);
            colorStdout.green(`${this.trim(numeral(accY).format('0'))},`);
            colorStdout.yellow(`${this.trim(numeral(velY).format('0'))}\n`);

            // colorStdout.green(`${this.trim(numeral(data.arx).format('0'))},`);
            // colorStdout.yellow(`${this.trim(numeral(data.ary).format('0'))}, `);
            // colorStdout.blue(`${this.trim(numeral(data.arz).format('0'))},`);
            // colorStdout.green(`${this.trim(numeral(data.awx).format('0'))},`);
            // colorStdout.yellow(`${this.trim(numeral(data.awy).format('0'))},`);
            // colorStdout.blue(`${this.trim(numeral(data.awz).format('0'))}\n`);
        } catch (err) {
        }
    }
}
