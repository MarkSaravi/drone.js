module.exports.CreateApplication = function () {
    let imuIsOpen = false;
    let escIsOpen = false;
    let bleIsOpen = false;
    process.stdin.setEncoding('utf8');

    process.on('imu-data', (r) => {
        //console.log(`Imu: roll: ${r.roll}, pitch: ${r.pitch}, yaw: ${r.yaw}, timeInterval: ${r.dt}`);
    });

    process.on('imu-connected', () => {
        imuIsOpen = true;
    });

    process.on('imu-disconnected', () => {
        imuIsOpen = false;
        exitApplication();
    });

    process.on('esc-connected', () => {
        escIsOpen = true;
    });

    process.on('esc-disconnected', () => {
        escIsOpen = false;
        exitApplication();
    });

    process.on('ble-connected', () => {
        bleIsOpen = true;
    });

    process.on('ble-disconnected', () => {
        bleIsOpen = false;
        exitApplication();
    });

    process.on('ble-data', (cmd) => {
        console.log(`Command: ${cmd}`);
    });

    function exitApplication() {
        if (imuIsOpen || escIsOpen || bleIsOpen) {
            return;
        }
        process.exit();
    }

    function start() {
        process.stdin.on('readable', () => {
            const chunk = process.stdin.read();
            if (chunk !== null && chunk === '\n') {
                process.emit('stop-application');
            } else if (chunk !== null && chunk.length >= 2) {
                process.emit('esc-data', chunk);
            }
        });
    }

    return {
        start
    };
}