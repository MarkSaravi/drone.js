module.exports.CreateDevice = function (portName, baudRate) {
    const SerialPort = require('serialport');

    const blePort = new SerialPort(portName, {
        baudRate: baudRate
    });

    blePort.on('open', () => {
        console.log(`BLE (${portName}) is connected.`);
        blePort.write('active');
        process.emit('ble-connected');
    });

    blePort.on('close', () => {
        console.log(`BLE (${portName}) is disconnected.`);
        process.emit('ble-disconnected');
    });

    process.on('stop-application', () =>{
        blePort.close();
    });

    let buffer = [];
    blePort.on('data', function (data) {
        for (let b of data) {
            //process.emit('ble-data', b);
            console.log(b);
            // if (b === 10) {
            //     try {
            //         let cmd = new Buffer(buffer).toString('ascii');
            //         process.emit('ble-data', cmd);
            //     } catch (ex) {
            //     }
            //     buffer = [];
            // } else {
            //     buffer.push(b);
            // }
        }
    });
}

