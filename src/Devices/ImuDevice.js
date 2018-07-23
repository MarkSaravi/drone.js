module.exports.CreateDevice = function (portName, baudRate) {
    const SerialPort = require('serialport');

    const imuPort = new SerialPort(portName, {
        baudRate: baudRate
    });

    imuPort.on('open', () => {
        console.log(`IMU (${portName}) is connected.`);
        process.emit('imu-connected');
    });

    imuPort.on('close', () => {
        console.log(`IMU (${portName}) is disconnected.`);
        process.emit('imu-disconnected');
    });

    process.on('stop-application', () =>{
        imuPort.close();
    });

    let buffer = [];
    imuPort.on('data', function (data) {
        for (let b of data) {
            if (b === 10) {
                try {
                    let r = JSON.parse(new Buffer(buffer).toString('ascii'));
                    process.emit('imu-data', r);
                } catch (ex) {
                }
                buffer = [];
            } else {
                buffer.push(b);
            }
        }
    });
}

