import Application from './Application';
import DeviceFinder from './DeviceFinder';
import PortInfo from './models/PortInfo';

let portsInfo = [
    {name: "/dev/ttyUSB", baudRate: 115200, type: 'imu', pattern: 'pitch'},
    {name: "/dev/ttyUSB", baudRate: 115200, type: 'esc', pattern: 'esc'}
];

let app = new Application(); 

app.on('devices-ready', (devices: PortInfo[])=>{
    for (let d of devices) {
        console.log(`${d.type}: ${d.name}, ${d.baudRate}`);
    }
    app.on('exit-application',() =>{

    });
});

app.on('stop-application',()=>{
    process.exit(0);
});

let deviceFinder = new DeviceFinder();
deviceFinder.on('device-detection-completed',(detectedList: PortInfo[]) =>{
    console.log('device-detection-completed');
    app.emit('devices-ready', detectedList);
});
deviceFinder.findDevices(portsInfo);

process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk != null ) {
        app.emit('stop-application');
    }
});
