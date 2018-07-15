module.exports.CreateApplication = function (eventHandler) {
    let imuIsOpen = false;
    process.stdin.setEncoding('utf8');

    eventHandler.on('imudata', (r) => {
        console.log(`roll: ${r.roll}, pitch: ${r.pitch}, yaw: ${r.yaw}, timeInterval: ${r.dt}`);
    });

    eventHandler.on('imu-connected', () => {
        imuIsOpen = true;
    });

    eventHandler.on('imu-disconnected', () => {
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
                eventHandler.emit('stop-application');
            }
        });
    }

    return {
        start
    };
}