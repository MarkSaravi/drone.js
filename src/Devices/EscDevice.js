module.exports.CreateDevice = function (devicesInfo) {
    const SerialPort = require('serialport');

    const escPort = new SerialPort(devicesInfo.escPort, {
        baudRate: devicesInfo.escBaudRate
    });

    escPort.on('open', () => {
        console.log(`ESC (${devicesInfo.escPort}) is connected.`);
        process.emit('esc-connected');
    });

    escPort.on('close', () => {
        console.log(`ESC (${devicesInfo.escPort}) is disconnected.`);
        process.emit('esc-disconnected');
    });

    process.on('stop-application', () => {
        escPort.close();
    });

    process.on('esc-data', function (data) {
        console.log(data + '\n');
        escPort.write(data, function (err) {
            if (err) {
                return console.log('Error on ESC write: ', err.message);
            }
        });
    });

}