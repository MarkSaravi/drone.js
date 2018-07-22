module.exports.CreateApplication = function () {
    let imuIsOpen = false;
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

    function exitApplication() {
        if (imuIsOpen) return;
        process.exit();
    }

    function start() {
        process.stdin.on('readable', () => {
            const chunk = process.stdin.read();
            if (chunk !== null && chunk === '\n') {
                process.emit('stop-application');
            }
        });
    }

    return {
        start
    };
}