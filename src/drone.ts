///<reference path="../node_modules/@types/node/index.d.ts" />
import Application from './application/Application';
import DeviceFinder from './devices/DeviceFinder';
import PortInfo from './models/PortInfo';
import FlightController from './application/FlightController';
const readline = require('readline');

let deviceFinder = new DeviceFinder();
const flightControl = new FlightController();
let app = new Application(flightControl);

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
    }

});
