///<reference path="../node_modules/@types/serialport/index.d.ts" />

import { EventEmitter } from 'events';
import SerialPort from 'serialport';

export default class DeviceFinder extends EventEmitter {
    constructor() {
        super();
    }

    findDevices(portName: string, baudRate: number, pattern: string, portType: string) {
        this.on('port-closed',(portFound) => {
            if (portFound) {
                console.log(`${portName} is ${portType}`);
            }
        });
        this.findDevice(portName, baudRate, pattern, portType);
    }

    findDevice(portName: string, baudRate: number, pattern: string, portType: string) {
        let portFound: boolean = false;
        let tryCounter = 0;
        let buffer: any[] = [];
        let serialport = new SerialPort(portName, {
            baudRate: baudRate,
            autoOpen: false
        });

        const onDataCallback = (data: any) => {
            for (let b of data) {
                if (b == 10) {
                    tryCounter++;
                    let str = new Buffer(buffer).toString('ascii');
                    portFound = str.indexOf(pattern) >= 0;
                    console.log(str);
                    if (portFound || tryCounter > 3) {
                        serialport.removeListener('data', onDataCallback);
                        serialport.close();
                        return;
                    }
                    buffer = [];
                } else {
                    buffer.push(b);
                }
            }
        }

        serialport.open((err) => {
            console.log(err);
            if (err) {
                console.log(`Error: Can not open ${portName}`);
            }
        });

        serialport.on('open', () => {
            console.log(`Listening to ${portName}`);
            serialport.on('data', onDataCallback);
        });

        serialport.on('close', () => {
            this.emit('port-closed', portFound);
        });

    }

}