const imuPortType = '/dev/ttyUSB';
const escDevType = '/dev/ttyUSB';
let imuPort = '/dev/ttyUSB1';
const imuBaudRate = 115200;
let escPort = '/dev/ttyUSB0';
const escBaudRate = 115200;
const imuEnabled = false;
const escEnabled = true;

function printObj(obj) {
    console.log(JSON.stringify(obj));
}

function findDevice(portNameBase, portIndex, baudRate, pattern, portType) {
    const portName = portNameBase + portIndex;
    const SerialPort = require('serialport');
    let portFound = false;
    const port = new SerialPort(portName, {
        baudRate: baudRate
    });
    port.on('open', function () {
        console.log(`Port ${portName} is open`);
    });
    port.on('close', function () {
        console.log(`Port ${portName} is closed`);
        process.emit('port-closed', {portName, baudRate, portType , portIndex, portFound})
    });

    let buffer = [];
    let counter = 0
    port.on('data', function (data) {
        for (let b of data) {
            if (b === 10) {
                let str = new Buffer(buffer).toString('ascii');
                if (str.includes(pattern)) {
                    console.log(`Port ${portName} is ${portType}`);
                    portFound = true;
                    port.close();
                } else {
                    counter++;
                    if (counter == 3) {
                        console.log(`Port ${portName} is not ${portType}`);
                        port.close();
                    }
                }
            } else {
                buffer.push(b);
            }
        }
    });
}

function startDeviceFinder(portNameBase, baudRate, pattern, portType) {
    findDevice(portNameBase, 0, baudRate, pattern, portType);
    // process.on('port-closed', function (portInfo) {
    //     console.log('***', `${printObj(portInfo)}`);
    //     if (portInfo && !portInfo.portFound) {
    //         findDevice(portNameBase, portInfo.portIndex + 1, baudRate, pattern, portType);
    //     }
    // });
    // process.emit('port-closed', { portNameBase, portIndex: -1, portFound: false });
}

module.exports.startDeviceFinder = startDeviceFinder;
// function () {
//     return {
//         imuEnabled,
//         imuPort,
//         imuBaudRate,
//         escEnabled,
//         escPort,
//         escBaudRate
//     };
// }