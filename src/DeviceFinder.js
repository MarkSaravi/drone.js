"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
///<reference path="../node_modules/@types/serialport/index.d.ts" />
//"sudo chown pi:pi /dev/serial0
var events_1 = require("events");
var serialport_1 = require("serialport");
var portsConfig = require('config.json')('./config.ports.json');
var DeviceFinder = /** @class */ (function (_super) {
    __extends(DeviceFinder, _super);
    function DeviceFinder() {
        return _super.call(this) || this;
    }
    DeviceFinder.prototype.findDevices = function () {
        var _this = this;
        var portsInfo = portsConfig.dynamicports;
        var portCounter = -1;
        var infoCounter = 0;
        var detectedList = [];
        this.on('port-closed', function (info) {
            if (info.found) {
                console.log(info.name + " is " + info.type);
                detectedList.push({ name: info.name, type: info.type, baudRate: info.baudRate, pattern: '' });
                infoCounter++;
            }
            portCounter++;
            if (portCounter == 10) {
                portCounter = 0;
                infoCounter++;
            }
            if (infoCounter >= portsInfo.length) {
                var devices = detectedList;
                for (var _i = 0, _a = portsConfig.staticports; _i < _a.length; _i++) {
                    var d = _a[_i];
                    devices.push(d);
                }
                _this.emit('devices-ready', devices);
            }
            else {
                var searchPortName_1 = portsInfo[infoCounter].name + portCounter;
                if (detectedList.filter(function (i) { return i.name == searchPortName_1; }).length > 0) {
                    _this.emit('port-closed', false, '', 0, '');
                }
                else {
                    _this.findDevice(searchPortName_1, portsInfo[infoCounter].baudRate, portsInfo[infoCounter].type, portsInfo[infoCounter].pattern);
                }
            }
        });
        this.emit('port-closed', false, '', 0, '');
    };
    DeviceFinder.prototype.findDevice = function (portName, baudRate, portType, pattern) {
        var _this = this;
        console.log("Searching for " + portType + " on " + portName);
        var portFound = false;
        var tryCounter = 0;
        var buffer = [];
        var serialport = new serialport_1["default"](portName, {
            baudRate: baudRate,
            autoOpen: false
        });
        var onDataCallback = function (data) {
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var b = data_1[_i];
                if (b == 10) {
                    tryCounter++;
                    var str = new Buffer(buffer).toString('ascii');
                    portFound = str.indexOf(pattern) >= 0;
                    //console.log(str);
                    if (portFound || tryCounter > 3) {
                        serialport.removeListener('data', onDataCallback);
                        serialport.close();
                        return;
                    }
                    buffer = [];
                }
                else {
                    buffer.push(b);
                }
            }
        };
        serialport.open(function (err) {
            if (err) {
                console.log("Error: Cann't open " + portName);
                _this.emit('port-closed', { found: false, name: '', baudRate: 0, type: '' });
            }
        });
        serialport.on('open', function () {
            //console.log(`Listening to ${portName}`);
            serialport.on('data', onDataCallback);
        });
        serialport.on('close', function () {
            _this.emit('port-closed', { found: portFound, name: portName, type: portType, baudRate: baudRate });
        });
    };
    return DeviceFinder;
}(events_1.EventEmitter));
exports["default"] = DeviceFinder;
