
var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyUSB0', {
  baudRate: 115200
});
console.log('hello');
port.on('open', function() {
    console.log('opening the port');
});
port.on('data', function (data) {
    console.log('Data:', new Buffer(data).toString('ascii'));
});