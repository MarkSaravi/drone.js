///<reference path="../../node_modules/@types/serialport/index.d.ts" />
import SerialPort from 'serialport';

export default class SerialDevice {
    port: SerialPort;
    constructor(portName: string, baudRate: number) {
        this.port = new SerialPort(portName, {
            baudRate: baudRate,
            autoOpen: false
        });
    }

    onData() {
    }

    onConnectionError(err: any) {
    }

    onConnected() {

    }

    onDisconnected() {
        
    }

    open() {
        this.port.on('open', () => {
            this.onConnected();
        });

        this.port.on('close', () => {
            this.onDisconnected();
        });
        this.port.on('data', () => {
            this.onData();
        });

        this.port.open((err) => {
            this.onConnectionError(err);
        });
    }

    close() {
        this.port.close();
    }
}