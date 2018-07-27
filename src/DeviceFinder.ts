///<reference path="../node_modules/@types/serialport/index.d.ts" />

import { EventEmitter } from 'events';
import SerialPort from 'serialport';
import PortInfo from './models/PortInfo';

export default class DeviceFinder extends EventEmitter {
    constructor() {
        super();
    }

    findDevices(portsInfo: PortInfo[]) {
        let portCounter: number = -1;
        let infoCounter: number = 0;
        let skipList: string[] = [];
        let detectedList: PortInfo[] = [];

        this.on('port-closed',(portFound, portName, baudRate, portType) => {
            if (portFound) {
                console.log(`${portName} is ${portType}`);
                detectedList.push({ name: portName, type: portType, baudRate: baudRate, pattern: ''});
                skipList.push(portName);
                infoCounter++;
            }
            portCounter++;
            if (portCounter == 10) {
                portCounter = 0;
                infoCounter++;
            }
            if (infoCounter >= portsInfo.length) {
                this.emit('search-over',{});
            } else {
                let newPortName = portsInfo[infoCounter].name + portCounter;
                if (skipList.indexOf(newPortName) >= 0) {
                    this.emit('port-closed', false, '', 0, '');
                } else {
                    this.findDevice(portsInfo[infoCounter].name + portCounter,
                        portsInfo[infoCounter].baudRate,
                        portsInfo[infoCounter].type,
                        portsInfo[infoCounter].pattern
                    );
                }
            }
        });

        this.emit('port-closed', false, '' ,0 , '');
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
            this.emit('port-closed', portFound, portName, portType, baudRate);
        });
    }

}