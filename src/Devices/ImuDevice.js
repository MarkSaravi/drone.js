module.exports.CreateImuDevice = function (devicesInfo) {
    const SerialPort = require('serialport');
    const imuPort = new SerialPort(devicesInfo.imuPort, {
        baudRate: devicesInfo.imuBaudRate
    });
    imuPort.on('open', () => {
        console.log(`${devicesInfo.imuPort} is connected.`);
    });
    imuPort.on('close', () => {
        console.log(`${devicesInfo.imuPort} is disconnected.`);
    });
    let buffer = [];
    let counter = 0;
    imuPort.on('data', function (data) {
        for (let b of data) {
            if (b === 10) {
                try {
                    let r = JSON.parse(new Buffer(buffer).toString('ascii'));
                    console.log(`${r.roll}, ${r.pitch}, ${r.yaw}, ${r.dt}`);
                } catch (ex) {
                }
                buffer = [];
                if (counter++ === 100) {
                    console.log('-------------------------------------------------');
                    counter = 0;
                }
            } else {
                buffer.push(b);
            }

        }
        //console.log('Data:', new Buffer(data).toString('ascii'));
    });
    function closeDevice() {
        imuPort.close();
    }
    return {
        get isOpen() {
            return imuPort.isOpen;
        },
        closeDevice
    }
}