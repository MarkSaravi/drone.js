const startDeviceFinder = require('./DeviceDetector.js').startDeviceFinder;
// if (devicesInfo.imuEnabled) {
//     require('./Devices/ImuDevice.js').CreateDevice(devicesInfo);
// }
// if (devicesInfo.escEnabled) {
//     require('./Devices/EscDevice.js').CreateDevice(devicesInfo);
// }
// const app = require('./Application.js').CreateApplication();

// app.start();
startDeviceFinder('/dev/ttyUSB', 115200, [{ pattern: 'pitch', portType:'imu'},{ pattern: 'esc', portType:'esc'}]);
//startDeviceFinder('/dev/ttyUSB', 115200, 'esc', 'esc');