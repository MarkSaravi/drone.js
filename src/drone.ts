import Application from './application/Application';
import DeviceFinder from './devices/DeviceFinder';
import PortInfo from './models/PortInfo';
import FlightController from './application/FlightController';

let deviceFinder = new DeviceFinder();
let app = new Application(new FlightController());

app.on('ble-send', (s) => {
    app.writeBLE(s);
});

deviceFinder.on('devices-ready', (devices: PortInfo[]) => {
    app.emit('devices-ready', devices);
});

app.start();
deviceFinder.findDevices();

var inputString = '';
process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (!chunk) return;
    console.log(chunk);
    for (let b of chunk) {
        if (b === 10) {
            console.log(inputString);
            if (inputString === '.') {
                app.emit('stopping-application');
            } else {
                app.emit('ble-send', inputString);
            }
            inputString = '';
        } else {
            inputString += String.fromCharCode(b as number);
        }
    }
});
