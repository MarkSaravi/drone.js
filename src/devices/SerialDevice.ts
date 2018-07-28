///<reference path="../../node_modules/@types/serialport/index.d.ts" />
import SerialPort from 'serialport';
import { EventEmitter } from 'events';

export default class SerialDevice extends EventEmitter {
    port: SerialPort;
    buffer:any[]=[];
    isopen: boolean = false;
    deviceName: string;
    portName: string;

    constructor(deviceName: string, portName: string, baudRate: number) {
        super();
        this.deviceName = deviceName;
        this.portName = portName;
        this.port = new SerialPort(portName, {
            baudRate: baudRate,
            autoOpen: false
        });
    }

    processData(incomingStr: string) {
        console.log(incomingStr);
    }

    onData(data: any[]) {
        for (let b of data) {
            if (b === 10) {
                try {
                    const incomingStr = new Buffer(this.buffer).toString('ascii');
                    //let r = JSON.parse();
                    //process.emit('imu-data', r);
                    this.processData(incomingStr);
                } catch (ex) {
                }
                this.buffer = [];
            } else {
                this.buffer.push(b);
            }
        }
    }

    onConnectionError(err: any) {
    }

    onConnected() {

    }

    isOpen(): boolean {
        return this.isopen;
    }

    open() {
        this.port.on('open', () => {
            this.isopen = true;
            this.onConnected();
        });

        this.port.on('close', () => {
            this.isopen = false;
            console.log(`${this.deviceName} on ${this.portName} is closed`);
            this.emit('device-closed');
        });
        this.port.on('data', (data) => {
            this.onData(data);
        });

        this.port.open((err) => {
            this.onConnectionError(err);
        });
    }

    close() {
        this.port.close();
    }
}