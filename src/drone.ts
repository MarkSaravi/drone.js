///<reference path="../node_modules/@types/node/index.d.ts" />
import Application from './application/Application';
import DeviceFinder from './devices/DeviceFinder';
import PortInfo from './models/PortInfo';
import FlightController from './application/FlightController';
const readline = require('readline');
import IFlightConfig from './models/IFlightConfig';
const config: IFlightConfig = require('config.json')('./config.flight.json');

let deviceFinder = new DeviceFinder();
const flightControl = new FlightController(config);
let app = new Application(flightControl, config);

app.on('ble-send', (s) => {
    app.writeBLE(s);
});

deviceFinder.on('devices-ready', (devices: PortInfo[]) => {
    app.emit('devices-ready', devices);
});

app.start();
deviceFinder.findDevices();

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on('keypress', (str, key) => {
    switch (str) {
        case 'q':
        case 'Q':
            app.emit('stopping-application');
            break;

        case ']':
            app.emit('inc-p-gain');
            break;
        case '[':
            app.emit('dec-p-gain');
            break;

        case '\'':
            app.emit('inc-i-gain');
            break;
        case ';':
            app.emit('dec-i-gain');
            break;

        case '.':
            app.emit('inc-d-gain');
            break;
        case ',':
            app.emit('dec-d-gain');
            break;
            
        case 'a':
        case 'A':
            app.emit('inc-power');
            break;
        case 'z':
        case 'Z':
            app.emit('dec-power');
            break;
        case 'g':
        case 'G':
            app.emit('mark-start');
            break;
        case 'h':
        case 'H':
            app.emit('mark-end');
            break;
        case 'p':
        case 'P':
            app.emit('toggle-p');
            break;
        case 'i':
        case 'I':
            app.emit('toggle-i');
            break;
        case 'd':
        case 'D':
            app.emit('toggle-d');
            break;
    }

});
