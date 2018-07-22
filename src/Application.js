module.exports.CreateApplication = function () {
    let imuIsOpen = false;
    let escIsOpen = false;
    process.stdin.setEncoding('utf8');

    process.on('imu-data', (r) => {
        console.log(`Process: roll: ${r.roll}, pitch: ${r.pitch}, yaw: ${r.yaw}, timeInterval: ${r.dt}`);
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

    function exitApplication() {
        if (imuIsOpen || escIsOpen) return;
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