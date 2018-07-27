import Application from './Application';
import DeviceFinder from './DeviceFinder';

let deviceFinder = new DeviceFinder();
//deviceFinder.findDevices('/dev/ttyUSB0', 115200, 'pitch', 'imu');
//let app = new Application(); 
//app.greeting('Mark');

process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    //console.log(chunk[0]);
    if (chunk != null ) {
        process.exit();
    }
});
