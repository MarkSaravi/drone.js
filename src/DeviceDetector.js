const imuPortType = '/dev/ttyUSB';
const escDevType = '/dev/ttyUSB';
let imuPort = '/dev/ttyUSB1';
const imuBaudRate = 115200;
let escPort = '/dev/ttyUSB0';
const escBaudRate = 115200;
const imuEnabled = false;
const escEnabled = true;

function findDevice(portName, baudRate, pattern, portType) {
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
        process.emit('port-closed', portFound);
    });

    let buffer = [];
    let counter = 0
    port.on('data', function (data) {
        for (let b of data) {
            if (b === 10) {
                let str = new Buffer(buffer).toString('ascii');
                if (str.indexOf(pattern) >= 0) {
                    console.log(`Port ${portName} is ${portType}`);
                    portFound = true;
                    port.close();
                } else {
                    counter++;
                    if (counter >= 3) {
                        console.log('!!!! ', str, ' !!!!');
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

function startDeviceFinder(portNameBase, baudRate, patterns) {
    let patternIndex = 0;
    let portIndex = -1;
    let searching = true;
    process.on('port-closed', function (portFound) {
        //console.log('***', `${JSON.stringify(portInfo)}`);        
        if (portFound) {
            portIndex = 0;
            patternIndex++;
        } else {
            portIndex++;
        }
        if (patternIndex == patterns.length) {
            process.emit('device-finding-end');
            return;
        }
        let portName = portNameBase + portIndex;
        findDevice(portName, baudRate, patterns[patternIndex].pattern, patterns[patternIndex].portType);
    });
    process.emit('port-closed', false);
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
