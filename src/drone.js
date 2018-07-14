const SerialPort = require('serialport');
const devicesInfo = require('./DeviceDetector.js').deviceDetector();
const imuDevice = require('./Devices/ImuDevice.js').CreateImuDevice(devicesInfo);
process.stdin.setEncoding('utf8');

function exit() {
    console.log('Checking for termination...');
    if (imuDevice.isOpen) {
        console.log('Not ready for termination.');
        return;
    }
    console.log('Application is terminated.');
    process.exit();
}

process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null && chunk==='\n') {
        imuDevice.closeDevice();
        setInterval(exit, 100);
    }
});

process.stdin.on('end', () => {
    //process.stdout.write('end');
});
