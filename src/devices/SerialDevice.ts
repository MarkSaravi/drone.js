///<reference path="../../node_modules/@types/serialport/index.d.ts" />
import ISerialDevice from './ISerialDevice';
import { Serial } from 'raspi-serial';
import { EventEmitter } from 'events';

export default class SerialDevice extends EventEmitter implements ISerialDevice {
    serial: Serial;
    buffer:any[]=[];
    isopen: boolean = false;
    deviceName: string;
    portName: string;

    constructor(deviceName: string, portName: string, baudRate: number) {
        super();
        this.deviceName = deviceName;
        this.portName = portName;
        this.serial = new Serial({portId: portName, baudRate});
    }

    write(data: string, writeEndHandler: ()=>void): void {
        this.serial.write(data);
        // this.port.write(data, function(err) {
        //     if (err) {
        //       return console.log('Error on write: ', err.message);
        //     }
        //     writeEndHandler();
        //   });
        // console.log(`Writing: ${data}`);
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
        this.serial.open();

        this.serial.on('open', () => {
            this.isopen = true;
            this.emit('open');
        });

        this.serial.on('close', () => {
            this.isopen = false;
            console.log(`${this.deviceName} on ${this.portName} is closed`);
            this.emit('close');
        });

        this.serial.on('data', (data) => {
            this.onData(data);
        });

        // this.port.open((err) => {
        //     if (err) {
        //         console.error(`Faile to open ${this.portName}. ${err}`);
        //     }
        // });
    }

    close() {
        this.serial.close();
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