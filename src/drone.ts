import Application from './Application';
import DeviceFinder from './DeviceFinder';
import PortInfo from './models/PortInfo';

let dynamicPortsInfo = [
    {name: "/dev/ttyUSB", baudRate: 115200, type: 'imu', pattern: 'pitch'},
    {name: "/dev/ttyUSB", baudRate: 115200, type: 'esc', pattern: 'esc'}
];

let staticPortsInfo = [
    {name: "/dev/ttyS0", baudRate: 115200, type: 'ble', pattern: 'pitch'}
];

let app = new Application(); 

let deviceFinder = new DeviceFinder();
deviceFinder.on('device-detection-completed',(detectedList: PortInfo[]) =>{
    app.emit('devices-ready', detectedList, staticPortsInfo);
});

deviceFinder.findDevices(dynamicPortsInfo);

process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk != null ) {
        app.emit('stop-application');
    }
});
