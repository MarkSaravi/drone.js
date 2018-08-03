"use strict";
exports.__esModule = true;
var Application_1 = require("./Application");
var DeviceFinder_1 = require("./DeviceFinder");
var deviceFinder = new DeviceFinder_1["default"]();
var app = new Application_1["default"]();
deviceFinder.on('devices-ready', function (devices) {
    app.emit('devices-ready', devices);
});
app.start();
deviceFinder.findDevices();
process.stdin.on('readable', function () {
    var chunk = process.stdin.read();
    if (chunk === '.') {
        app.emit('stopping-application');
    }
});
