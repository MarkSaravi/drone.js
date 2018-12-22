///<reference path="../../node_modules/@types/serialport/index.d.ts" />
import ISerialDevice from './ISerialDevice';
import SerialPort from 'serialport';
import { EventEmitter } from 'events';

export default class SerialDevice extends EventEmitter implements ISerialDevice {
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

    write(data: string, writeEndHandler: ()=>void): void {
        this.port.write(data, function(err) {
            if (err) {
              return console.log('Error on write: ', err.message);
            }
            writeEndHandler();
          });
        console.log(`Writing: ${data}`);
    }

    onData(data: any[]) {
        for (let b of data) {
            if (b === 10) {
                try {
                    const incomingStr = new Buffer(this.buffer).toString('ascii');
                    this.emit('data', incomingStr);
                } catch (ex) {
                }
                this.buffer = [];
            } else {
                this.buffer.push(b);
            }
        }
    }

    isOpen(): boolean {
        return this.isopen;
    }

    open() {
        this.port.on('open', () => {
            this.isopen = true;
            this.emit('open');
        });

        this.port.on('close', () => {
            this.isopen = false;
            console.log(`${this.deviceName} on ${this.portName} is closed`);
            this.emit('close');
        });
        this.port.on('data', (data) => {
            this.onData(data);
        });

        this.port.open((err) => {
            if (err) {
                console.error(`Faile to open ${this.portName}. ${err}`);
            }
        });
    }

    close() {
        this.port.close();
    }

    registerCloseEvent(callback: () => void){
        this.on('close', callback);
    }

    registerDataEvent(callback: (data: string) => void){
        this.on('data', callback);
    }

    registerOpenEvent(callback: () => void){
        this.on('open', callback);
    }
}