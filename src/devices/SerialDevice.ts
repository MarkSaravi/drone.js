import { IPortConfig } from '../models/PortConfig';
import ISerialDevice from './ISerialDevice';
import { Serial } from 'raspi-serial';
import { EventEmitter } from 'events';

export default class SerialDevice extends EventEmitter implements ISerialDevice {
    serial: Serial;
    buffer: any[] = [];
    isopen: boolean = false;

    constructor(private readonly config: IPortConfig) {
        super();
    }

    write(data: string, callback: () => void): void {
        if (this.isopen) {
            this.serial.write(data);
        }

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

    open(onData: () => void, onClose: () => void) {
        this.serial = new Serial({ portId: this.config.name, baudRate: this.config.baudRate });
        this.serial.open(() => {
            this.isopen = true;
            console.log(`${this.config.type} is open.`);
            // this.serial.on('data', (data) => {
            //     this.onData(data);
            // });
            this.serial.on('close', () => {
                this.isopen = false;
                console.log(`${this.config.type} is closed.`);
            });
        });


        // this.serial.on('open', () => {
        //     this.isopen = true;
        //     this.emit('open');
        // });

        // this.serial.on('close', () => {
        //     this.isopen = false;
        //     console.log(`${this.deviceName} on ${this.portName} is closed`);
        //     this.emit('close');
        // });

        // this.serial.on('data', (data) => {
        //     this.onData(data);
        // });

        // this.port.open((err) => {
        //     if (err) {
        //         console.error(`Faile to open ${this.portName}. ${err}`);
        //     }
        // });
    }

    close() {
        this.serial.close();
    }
}