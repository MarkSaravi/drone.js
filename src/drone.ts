///<reference path="../node_modules/@types/node/index.d.ts" />
import Application from './application/Application';
import DeviceFinder from './devices/DeviceFinder';
import PortInfo from './models/PortInfo';
import FlightController from './application/FlightController';
const keypress = require('keypress');

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

keypress(process.stdin);
process.stdin.on('keypress', function (ch, key) {
    console.log('got "keypress"', key);
    if (key && key.ctrl && key.name == 'c') {
      }
 
        // switch(b) {
        //     case 10: 
        //         app.emit('stopping-application');
        //         break;
        //     case '+': 
        //         app.emit('inc-gain');
        //         break;
        //     case '-':
        //         app.emit('dec-gain');
        //         break;
        // }

        // if (b === 10) {
        //     console.log(inputString);
        //     if (inputString === '.') {
        //         app.emit('stopping-application');
        //     } else if (inputString === '+'){
        //         const emt = new EventEmitter();
        //         emt.emit('inc-gain', {});
        //         console.log('inc');
        //     } else if (inputString === '-'){
        //         console.log('dec');
        //     }
        //     inputString = '';
        // } else {
        //     inputString += String.fromCharCode(b as number);
        // }

});
