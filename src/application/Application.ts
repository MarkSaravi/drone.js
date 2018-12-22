///<reference path="../../node_modules/@types/node/index.d.ts" />
import { EventEmitter } from 'events';
const readline = require('readline');
import { IPortsConfig, IPortConfig } from '../models/PortConfig';
const flightConfig: IFlightConfig = require('config.json')('./config.flight.json');
const portsConfig: IPortsConfig = require('config.json')('./config.ports.json');
const SerialPort = require('serialport');
import FlightController from './FlightController';
import IFlightConfig from '../models/IFlightConfig';
import * as convertors from '../convertors';

export default class Application extends EventEmitter {
    imu: any;
    esc: any;
    ble: any;
    flightConfig: IFlightConfig;
    deviceCounter: number = 0;
    
    constructor(private readonly flightController: FlightController) {
        super();
        this.flightConfig = flightConfig;
    }

    startApp() {
        console.log('starting the application');
        this.registerConsoleCommands(); 
        this.openDevices();
        this.registerEvents();
    }

    initDevice(config: IPortConfig, onDataHandler: (data: string)=>void) {
        const Readline = SerialPort.parsers.Readline;
        const port = new SerialPort(config.name, { baudRate: config.baudRate, autoOpen: false });
        port.on('open', () => {
            this.deviceCounter++;
            console.log(`${config.type} is opened.`);
            port.flush();
        })
        port.on('close', () => {
            console.log(`${config.type} is closed.`);
            this.deviceCounter--;
            this.emit('exit-application');
        })
        port.open();
        const parser = new Readline()
        port.pipe(parser)
        parser.on('data', (str: string)=>{
            onDataHandler(str);
        });
        return port;
   }

    openDevices() {
        console.log('trying to open port...');
        this.imu = this.initDevice(portsConfig.imu, this.onImuData);
        this.esc = this.initDevice(portsConfig.esc, this.onEscData);
        this.ble = this.initDevice(portsConfig.ble, this.onBleData);
    }

    registerConsoleCommands() { 
        readline.emitKeypressEvents(process.stdin);    
        process.stdin.setRawMode(true);
        process.stdin.on('keypress', (str, key) => {
            switch (str) {
                case 'q':
                case 'Q':
                    this.emit('close-devices');
                    break;
                // case ']':
                //     this.emit('inc-p-gain');
                //     break;
                // case '[':
                //     this.emit('dec-p-gain');
                //     break;
    
                // case '\'':
                //     this.emit('inc-i-gain');
                //     break;
                // case ';':
                //     this.emit('dec-i-gain');
                //     break;
    
                // case 'l':
                // case 'L':
                //     this.emit('inc-d-gain');
                //     break;
                // case 'k':
                // case 'K':
                //     this.emit('dec-d-gain');
                //     break;
    
                // case 'a':
                // case 'A':
                //     this.emit('inc-power');
                //     break;
    
                // case 'z':
                // case 'Z':
                //     this.emit('dec-power');
                //     break;
    
                // case 'p':
                // case 'P':
                //     this.emit('toggle-p');
                //     break;
    
                // case 'i':
                // case 'I':
                //     this.emit('toggle-i');
                //     break;
    
                // case 'd':
                // case 'D':
                //     this.emit('toggle-d');
                //     break;
            }
        });
        setInterval(()=>{
            process.stdin.resume();
        },5);
        process.stdin.pause();
    }
    
    registerEvents() {
        this.on('tilt-forward', () => {
            this.flightController.tiltForward();
        });

        this.on('tilt-backward', () => {
            this.flightController.tiltBackward();
        });

        this.on('tilt-right', () => {
            this.flightController.tiltRight();
        });

        this.on('tilt-left', () => {
            this.flightController.tiltLeft();
        });

        this.on('turn-right', () => {
            this.flightController.turnRight();
        });

        this.on('turn-left', () => {
            this.flightController.turnLeft();
        });

        this.on('inc-p-gain', () => {
            this.flightController.incPGain();
        });

        this.on('dec-p-gain', () => {
            this.flightController.decPGain();
        });

        this.on('inc-i-gain', () => {
            this.flightController.incIGain();
        });

        this.on('dec-i-gain', () => {
            this.flightController.decIGain();
        });

        this.on('inc-d-gain', () => {
            this.flightController.incDGain();
        });

        this.on('dec-d-gain', () => {
            this.flightController.decDGain();
        });

        this.on('inc-power', () => {
            this.flightController.incPower();
        });

        this.on('dec-power', () => {
            this.flightController.decPower();
        });

        this.on('toggle-p', () => {
            this.flightController.toggleP();
        });

        this.on('toggle-i', () => {
            this.flightController.toggleI();
        });

        this.on('toggle-d', () => {
            this.flightController.toggleD();
        });

        // this.on('stopping-application', () => {
        //     const escCommand = this.flightController.stop();
        //     // this.escDevice.write(escCommand, () => {
        //     //     console.log('Closing the ports...');
        //     // });
        //     for (let d of this.devices) {
        //         // d.close();
        //     }
        // });

        this.on('imu-data', data => {
            console.log(`imu data: ${data}`);
        });

        this.on('close-devices', () => {
            console.log('Closing devices.');
            this.imu.close();
            this.esc.close();
            this.ble.close();
        });

        this.on('exit-application', () => {
            if (this.deviceCounter != 0) {
                return;
            }
            console.log('exiting application');
            process.exit(0);
        });

        // this.on('start-application', (configs: PortInfo[]) => {
        //     this.imuDevice = this.openDevice('imu', configs, (s) => { this.onImuData(s); }, () => { console.log('IMU is connected'); });
        //     this.escDevice = this.openDevice('esc', configs, (s) => { this.onEscData(s); }, () => { console.log('ESC is connected'); });
        //     this.bleDevice = this.openDevice('ble', configs, (s) => { this.onBleData(s); }, () => { console.log('BLE is connected'); });
        // });
    }

    writeBLE(s: string): void {
    }

    onImuData(imuJson: string) {
        console.log(JSON.stringify(imuJson));
        // const imuData = convertors.JsonToImuData(
        //     imuJson, this.flightConfig.rollPolarity,
        //     this.flightConfig.pitchPolarity,
        //     this.flightConfig.yawPolarity);
        // console.log(JSON.stringify(imuData));
        // this.flightController.applyImuData(imuData);

        // const escCommand = this.flightController.calcMotorsPower();
        // this.escDevice.write(escCommand, () => {
        //     console.log('Command sent...');
        // });
    }

    onEscData(escString: string) {
    }

    onBleData(bleJson: string) {
        // {"x":0,"y":-3,"h":0,"p":42.5}
        // console.log(bleJson);
        // const cmd = convertors.JsonToCommand(bleJson);
        // this.flightController.applyCommand(cmd);
    }

    // openDevice(type: string, configs: PortInfo[],
    //     dataEventCallback: (data: string) => void,
    //     openEventCallback: () => void): SerialDevice {
    //     let config = configs.filter(d => d.type == type)[0];
    //     console.log(`Opening ${type}: ${JSON.stringify(config)}`);
    //     const device: SerialDevice = new SerialDevice(type, config.name, config.baudRate);
    //     // device.open();
    //     // device.registerOpenEvent(openEventCallback);
    //     device.registerCloseEvent(() => {
    //         this.emit('stop-application');
    //     });
    //     device.registerDataEvent(dataEventCallback);
    //     this.devices.push(device);
    //     return device;
    // }
}
