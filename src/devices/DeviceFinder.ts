///<reference path="../../node_modules/@types/serialport/index.d.ts" />

import { EventEmitter } from 'events';
import SerialPort from 'serialport';
import PortInfo from '../models/PortInfo';
const portsConfig = require('config.json')('./config.ports.json');

interface PortClosedInfo {
    found: boolean,
    name: string,
    baudRate: number,
    type: string
}
export default class DeviceFinder extends EventEmitter {
    constructor() {
        super();
    }

    findDevices() {
        let portsInfo = portsConfig.dynamicports;
        let portCounter: number = -1;
        let infoCounter: number = 0;
        let detectedList: PortInfo[] = [];

        this.on('port-closed',(info: PortClosedInfo) => {
            if (info.found) {
                console.log(`${info.name} is ${info.type}`);
                detectedList.push({ name: info.name, type: info.type, baudRate: info.baudRate, pattern: ''});
                portCounter = -1;
                infoCounter++;
            }
            portCounter++;
            if (portCounter == 10) {
                portCounter = 0;
                infoCounter++;
            }
            if (infoCounter >= portsInfo.length) {
                let devices:PortInfo[] =  detectedList;
                for (let d of portsConfig.staticports) {
                    devices.push(d);
                }
                this.emit('devices-ready', devices);
            } else {
                let searchPortName = portsInfo[infoCounter].name + portCounter;
                if (detectedList.filter(i => i.name == searchPortName).length > 0) {
                    this.emit('port-closed', false, '', 0, '');
                } else {
                    this.findDevice(searchPortName,
                        portsInfo[infoCounter].baudRate,
                        portsInfo[infoCounter].type,
                        portsInfo[infoCounter].pattern
                    );
                }
            }
        });

        this.emit('port-closed', false, '' ,0 , '');
    }

    findDevice(portName: string, baudRate: number, portType: string, pattern: string) {
        console.log(`Searching for ${portType} on ${portName}`);
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
                    //console.log(str);
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
            if (err) {
                console.log(`Error: Cann't open ${portName}`);
                this.emit('port-closed', {found: false, name: '', baudRate: 0, type: ''});
            }
        });

        serialport.on('open', () => {
            //console.log(`Listening to ${portName}`);
            serialport.on('data', onDataCallback);
        });

        serialport.on('close', () => {
            this.emit('port-closed', {found: portFound, name: portName, type: portType, baudRate: baudRate});
        });
    }

}