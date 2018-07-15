module.exports.CreateImuDevice = function (devicesInfo, eventHandler) {
    const SerialPort = require('serialport');

    const imuPort = new SerialPort(devicesInfo.imuPort, {
        baudRate: devicesInfo.imuBaudRate
    });

    imuPort.on('open', () => {
        console.log(`${devicesInfo.imuPort} is connected.`);
        eventHandler.emit('imu-connected');
    });

    imuPort.on('close', () => {
        console.log(`${devicesInfo.imuPort} is disconnected.`);
        eventHandler.emit('imu-disconnected');
    });

    eventHandler.on('stop-application', () =>{
        imuPort.close();
    });

    let buffer = [];
    imuPort.on('data', function (data) {
        for (let b of data) {
            if (b === 10) {
                try {
                    let r = JSON.parse(new Buffer(buffer).toString('ascii'));
                    //console.log(`In IMU: ${r.roll}, ${r.pitch}, ${r.yaw}, ${r.dt}`);
                    eventHandler.emit('imudata', r);
                } catch (ex) {
                }
                buffer = [];
            } else {
                buffer.push(b);
            }

        }
    });
}

