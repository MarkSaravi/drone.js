const imuPort = '/dev/ttyUSB0';
const imuBaudRate = 115200;
const escPort = '/dev/ttyUSB1';
const escBaudRate = 115200;

module.exports.deviceDetector = function() {
    return {
        imuPort,
        imuBaudRate
    };
}