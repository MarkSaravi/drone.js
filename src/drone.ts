import Application from './Application';
import DeviceFinder from './DeviceFinder';

let portsInfo = [
    {name: "ttyUSB", baudRate: 115200, type: 'imu', pattern: 'pitch'},
    {name: "ttyUSB", baudRate: 115200, type: 'esc', pattern: 'esc'}
];

let deviceFinder = new DeviceFinder();
deviceFinder.findDevices(portsInfo);
deviceFinder.on('device-detection-completed',() =>{
    console.log('device-detection-completed');
});
//let app = new Application(); 
//app.greeting('Mark');

process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    //console.log(chunk[0]);
    if (chunk != null ) {
        process.exit();
    }
});
