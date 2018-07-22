const devicesInfo = require('./DeviceDetector.js').deviceDetector();
if (devicesInfo.imuEnabled) {
    require('./Devices/ImuDevice.js').CreateDevice(devicesInfo);
}
if (devicesInfo.escEnabled) {
    require('./Devices/EscDevice.js').CreateDevice(devicesInfo);
}
const app = require('./Application.js').CreateApplication();

app.start();
