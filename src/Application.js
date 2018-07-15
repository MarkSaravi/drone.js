module.exports.CreateApplication = function (imuDevice) {
    const EventEmitter = require('events');

    class EventHandler extends EventEmitter { }

    const eventHandler = new EventHandler();
    process.stdin.setEncoding('utf8');

    eventHandler.on('imudata', (r) => {
        console.log(`In Application: ${r.roll}, ${r.pitch}, ${r.yaw}, ${r.dt}`);
    });

    function exit() {
        console.log('Checking for termination...');
        if (imuDevice.isOpen) {
            console.log('Not ready for termination.');
            return;
        }
        console.log('Application is terminated.');
        process.exit();
    }

    function start() {
        process.stdin.on('readable', () => {
            const chunk = process.stdin.read();
            if (chunk !== null && chunk === '\n') {
                imuDevice.closeDevice();
                setInterval(exit, 100);
            }
        });
    }

    process.stdin.on('end', () => {
        //process.stdout.write('end');
    });
    return {
        start,
        imuData: function(r) {
            eventHandler.emit('imudata', r);
        }
    };
}