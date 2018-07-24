const startDeviceFinder = require('./DeviceDetector.js').startDeviceFinder;
startDeviceFinder('/dev/ttyUSB', 115200, [{ pattern: 'pitch', portType:'imu'},{ pattern: 'esc', portType:'esc'}]);
process.on('device-finding-end', function(devicesInfo){
    if (!devicesInfo.imu) {
        console.log('Can not find IMU device');
        process.exit();
    }
    if (!devicesInfo.esc) {
        console.log('Can not find ESC device');
        process.exit();
    }
    require('./Devices/ImuDevice.js').CreateDevice(devicesInfo.imu.portName, devicesInfo.imu.baudRate);
    require('./Devices/EscDevice.js').CreateDevice(devicesInfo.esc.portName, devicesInfo.esc.baudRate);
    require('./Devices/BleDevice.js').CreateDevice('/dev/serial0', devicesInfo.esc.baudRate);
    const app = require('./Application.js').CreateApplication();
    app.start();
});
