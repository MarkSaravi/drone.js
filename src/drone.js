const SerialPort = require('serialport');
const devicesInfo = require('./DeviceDetector.js').deviceDetector();
const imuDevice = require('./Devices/ImuDevice.js').CreateImuDevice(devicesInfo);
const app = require('./Application.js').CreateApplication(imuDevice);
imuDevice.registerDataEvent(r => {
    app.imuData(r);
});
app.start();
