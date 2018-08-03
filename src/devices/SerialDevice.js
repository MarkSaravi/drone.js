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
var serialport_1 = require("serialport");
var events_1 = require("events");
var SerialDevice = /** @class */ (function (_super) {
    __extends(SerialDevice, _super);
    function SerialDevice(deviceName, portName, baudRate) {
        var _this = _super.call(this) || this;
        _this.buffer = [];
        _this.isopen = false;
        _this.deviceName = deviceName;
        _this.portName = portName;
        _this.port = new serialport_1["default"](portName, {
            baudRate: baudRate,
            autoOpen: false
        });
        return _this;
    }
    SerialDevice.prototype.write = function (data) {
        this.port.write(data, function (err) {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
            console.log('message written');
        });
        console.log("Writing: " + data);
    };
    SerialDevice.prototype.onData = function (data) {
        console.log(data);
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var b = data_1[_i];
            if (b === 10) {
                try {
                    var incomingStr = new Buffer(this.buffer).toString('ascii');
                    this.emit('data', incomingStr);
                }
                catch (ex) {
                }
                this.buffer = [];
            }
            else {
                this.buffer.push(b);
            }
        }
    };
    SerialDevice.prototype.isOpen = function () {
        return this.isopen;
    };
    SerialDevice.prototype.open = function () {
        var _this = this;
        this.port.on('open', function () {
            _this.isopen = true;
            _this.emit('open');
        });
        this.port.on('close', function () {
            _this.isopen = false;
            console.log(_this.deviceName + " on " + _this.portName + " is closed");
            _this.emit('close');
        });
        this.port.on('data', function (data) {
            _this.onData(data);
        });
        this.port.open(function (err) {
            if (err) {
                console.error("Faile to open " + _this.portName + ". " + err);
            }
        });
    };
    SerialDevice.prototype.close = function () {
        this.port.close();
    };
    SerialDevice.prototype.registerCloseEvent = function (callback) {
        this.on('close', callback);
    };
    SerialDevice.prototype.registerDataEvent = function (callback) {
        this.on('data', callback);
    };
    SerialDevice.prototype.registerOpenEvent = function (callback) {
        this.on('open', callback);
    };
    return SerialDevice;
}(events_1.EventEmitter));
exports["default"] = SerialDevice;
