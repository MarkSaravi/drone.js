const devicesInfo = require('./DeviceDetector.js').deviceDetector();
require('./Devices/ImuDevice.js').CreateDevice(devicesInfo);
require('./Devices/EscDevice.js').CreateDevice(devicesInfo);
const app = require('./Application.js').CreateApplication();

app.start();
