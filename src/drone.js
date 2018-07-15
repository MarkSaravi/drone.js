const devicesInfo = require('./DeviceDetector.js').deviceDetector();
require('./Devices/ImuDevice.js').CreateImuDevice(devicesInfo);
const app = require('./Application.js').CreateApplication();

app.start();
