module.exports.CreateDevice = function (devicesInfo) {
    const SerialPort = require('serialport');

    const imuPort = new SerialPort(devicesInfo.imuPort, {
        baudRate: devicesInfo.imuBaudRate
    });

    imuPort.on('open', () => {
        console.log(`IMU (${devicesInfo.imuPort}) is connected.`);
        process.emit('imu-connected');
    });

    imuPort.on('close', () => {
        console.log(`ESC (${devicesInfo.imuPort}) is disconnected.`);
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
                    //console.log(`In IMU: ${r.roll}, ${r.pitch}, ${r.yaw}, ${r.dt}`);
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

