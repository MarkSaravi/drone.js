///<reference path="../node_modules/@types/serialport/index.d.ts" />

import {EventEmitter} from 'events';
import SerialPort from 'serialport';

export default class DeviceFinder extends EventEmitter {
    portFound: boolean = false;
    buffer: any[] = [];
    tryCounter: number = 0;

    constructor() {
        super();
    }

    findDevices(portName: string, baudRate: number, pattern: string, portType: string) {
        let serialport = new SerialPort(portName, {
            baudRate: 115200,
            autoOpen: false
        });

        serialport.open((err) =>{
            if (err) {
                console.log(`Error: Can not open ${portName}`);
            }
        });

        this.on('open', () =>{
            console.log(`Listening to ${portName}`);
        });

        this.on('close', ()=>{
            console.log(`${portName} is closed`);
            this.emit('port-closed', this.portFound);
        });

        serialport.on('data', (data) => {
            for (let b of data) {
                if (b == 10) {
                    serialport.close();
                }
            }
        });
    }

}