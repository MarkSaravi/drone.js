import Application from './Application';
import DeviceFinder from './DeviceFinder';
import PortInfo from './models/PortInfo';

let deviceFinder = new DeviceFinder();
let app = new Application(); 

deviceFinder.on('devices-ready',(devices: PortInfo[]) =>{
    app.emit('devices-ready', devices);
});

app.start();
deviceFinder.findDevices();

process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk != null ) {
        app.emit('stopping-application');
    }
});
