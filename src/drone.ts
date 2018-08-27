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
        case '.':
            app.emit('stopping-application');
            break;
        case '+':
            app.emit('inc-gain');
            console.log('**** inc-gain');
            break;
        case '-':
            app.emit('dec-gain');
            console.log('**** dec-gain');
            break;
    }

});

// if (key.ctrl && key.name === 'c') {
//     process.exit();
// } else {
//     console.log(`You pressed the "${str}" key`);
//     console.log();
//     console.log(key);
//     console.log();
// }
