///<reference path="../node_modules/@types/serialport/index.d.ts" />

import { EventEmitter } from 'events';
import SerialPort from 'serialport';

export default class DeviceFinder extends EventEmitter {
    portFound: boolean = false;
    buffer: any[] = [];
    tryCounter: number = 0;
    serialport: SerialPort;

    constructor() {
        super();
    }

    findDevices(portName: string, baudRate: number, pattern: string, portType: string) {
        this.serialport = new SerialPort(portName, {
            baudRate: baudRate,
            autoOpen: false
        });

        const onDataCallback = (data: any) => {
            for (let b of data) {
                if (b == 10) {
                    this.tryCounter++;
                    let str = new Buffer(this.buffer).toString('ascii');
                    this.portFound = str.indexOf(pattern) >= 0;
                    console.log(str);
                    if (this.portFound || this.tryCounter > 3) {
                        this.serialport.removeListener('data', onDataCallback);
                        this.serialport.close();
                        return;
                    }
                    this.buffer = [];
                } else {
                    this.buffer.push(b);
                }
            }
        }

        this.serialport.open((err) => {
            console.log(err);
            if (err) {
                console.log(`Error: Can not open ${portName}`);
            }
        });

        this.serialport.on('open', () => {
            console.log(`Listening to ${portName}`);
            this.serialport.on('data', onDataCallback);
        });

        this.serialport.on('close', () => {
            if (this.portFound) {

            }
            this.emit('port-closed', this.portFound);
        });

        this.on('port-closed',() => {
            if (this.portFound) {
                console.log(`${portName} is ${portType}`);
            }
        });

    }

}