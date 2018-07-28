import Application from './Application';
import DeviceFinder from './DeviceFinder';
import PortInfo from './models/PortInfo';



let app = new Application(); 

let deviceFinder = new DeviceFinder();
deviceFinder.on('devices-ready',(devices: PortInfo[]) =>{
    app.emit('devices-ready', devices);
});

deviceFinder.findDevices();

process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk != null ) {
        app.emit('stop-application');
    }
});
