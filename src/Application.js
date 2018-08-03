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
///<reference path="../node_modules/@types/node/index.d.ts" />
var events_1 = require("events");
var SerialDevice_1 = require("./devices/SerialDevice");
var EulerTransforms_1 = require("./EulerTransforms");
var Application = /** @class */ (function (_super) {
    __extends(Application, _super);
    function Application() {
        var _this = _super.call(this) || this;
        _this.devices = [];
        return _this;
    }
    Application.prototype.start = function () {
        this.registerEvents();
    };
    Application.prototype.onImuData = function (imuData) {
        var r = JSON.parse(imuData);
        var _a = EulerTransforms_1.RotateAroundZ(r.roll, r.pitch, Math.PI / 4), nr = _a[0], np = _a[1];
        var rotations = {
            roll: nr,
            pitch: np,
            yaw: r.yaw
        };
        //console.log(`${rotations.roll}, ${rotations.pitch}, ${rotations.yaw}`);
    };
    Application.prototype.onBleOpen = function () {
        console.log("BLE is connected.");
        this.bleDevice.write('active');
    };
    Application.prototype.onBleData = function (bleData) {
        console.log("BLE: " + bleData);
    };
    Application.prototype.registerEvents = function () {
        var _this = this;
        this.on('stopping-application', function () {
            for (var _i = 0, _a = _this.devices; _i < _a.length; _i++) {
                var d = _a[_i];
                d.close();
            }
        });
        this.on('stop-application', function () {
            for (var _i = 0, _a = _this.devices; _i < _a.length; _i++) {
                var d = _a[_i];
                if (d.isOpen()) {
                    return;
                }
            }
            process.exit(0);
        });
        this.on('devices-ready', function (configs) {
            for (var _i = 0, configs_1 = configs; _i < configs_1.length; _i++) {
                var c = configs_1[_i];
                console.log(c.type + ": " + c.name + ", " + c.baudRate);
            }
            //this.imuDevice = this.openDevice('imu', configs, (s) => { this.onImuData(s); }, () => {});
            //this.escDevice = this.openDevice('esc', configs, (s) => { }, () => {});
            _this.bleDevice = _this.openDevice('ble', configs, function (s) { _this.onBleData(s); }, function () { _this.onBleOpen(); });
        });
    };
    Application.prototype.openDevice = function (type, configs, dataEventCallback, openEventCallback) {
        var _this = this;
        var config = configs.filter(function (d) { return d.type == type; })[0];
        var device = new SerialDevice_1["default"](type, config.name, config.baudRate);
        device.open();
        device.registerOpenEvent(openEventCallback);
        device.registerCloseEvent(function () {
            _this.emit('stop-application');
        });
        device.registerDataEvent(dataEventCallback);
        this.devices.push(device);
        return device;
    };
    return Application;
}(events_1.EventEmitter));
exports["default"] = Application;
