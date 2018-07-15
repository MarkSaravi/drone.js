const EventEmitter = require('events');
const devicesInfo = require('./DeviceDetector.js').deviceDetector();
const eventHandler = new EventEmitter();

const imuDevice = require('./Devices/ImuDevice.js').CreateImuDevice(devicesInfo, eventHandler);
const app = require('./Application.js').CreateApplication(eventHandler);

app.start();
