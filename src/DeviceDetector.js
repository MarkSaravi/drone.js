// const imuPortType = '/dev/ttyUSB';
// const escDevType = '/dev/ttyUSB';
// let imuPort = '/dev/ttyUSB1';
// const imuBaudRate = 115200;
// let escPort = '/dev/ttyUSB0';
// const escBaudRate = 115200;
// const imuEnabled = false;
// const escEnabled = true;
let portsInfo = {};
function findDevice(portName, baudRate, pattern, portType) {
    const SerialPort = require('serialport');
    let portFound = false;
    const port = new SerialPort(portName, {
        baudRate: baudRate,
        autoOpen: false
    });
    port.open(function(err){
        if (err) {
            console.log(`Error: Can not open ${portName}`);
            process.emit('port-closed', portFound);    
        }
    });
    port.on('open', function () {
        console.log(`Listening to ${portName}`);
    });
    port.on('close', function () {
        console.log(`${portName} is closed`);
        process.emit('port-closed', portFound);
    });

    let buffer = [];
    let counter = 0
    port.on('data', function (data) {
        for (let b of data) {
            if (b === 10) {
                let str = new Buffer(buffer).toString('ascii');
                if (str.indexOf(pattern) >= 0) {
                    port.removeListener('data',()=>{});
                    console.log(`Port ${portName} is ${portType.toUpperCase()}`);
                    portsInfo[portType] = { portName, baudRate };
                    portFound = true;
                    port.close();
                } else {
                    counter++;
                    if (counter >= 3) {
                        port.removeListener('data',()=>{});
                        console.log(`Port ${portName} is not ${portType.toUpperCase()}`);                        
                        port.close();
                        return;
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

    process.on('port-closed', function (portFound) {
        if (portFound || portIndex > 9) {
            portIndex = 0;
            patternIndex++;
        } else {
            portIndex++;
        }
        if (patternIndex == patterns.length) {
            process.emit('device-finding-end', portsInfo);
            return;
        }
        let portName = portNameBase + portIndex;
        findDevice(portName, baudRate, patterns[patternIndex].pattern, patterns[patternIndex].portType);
    });
    process.emit('port-closed', false);
}

module.exports.startDeviceFinder = startDeviceFinder;

