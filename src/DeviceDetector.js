const imuPort = '/dev/ttyUSB1';
const imuBaudRate = 115200;
const escPort = '/dev/ttyUSB0';
const escBaudRate = 115200;
const imuEnabled = false;
const escEnabled = true;

module.exports.deviceDetector = function() {
    return {
        imuEnabled,
        imuPort,
        imuBaudRate,
        escEnabled,
        escPort,
        escBaudRate
    };
}