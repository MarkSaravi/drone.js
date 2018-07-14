const SerialPort = require('serialport');
const devicesInfo = require('./DeviceDetector.js').deviceDetector();

process.stdin.setEncoding('utf8');

function exit() {
    console.log('Checking for termination...');
    if (imuPort.isOpen) {
        console.log('Not ready for termination.');
        return;
    }
    console.log('Application is terminated.');
    process.exit();
}

process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null && chunk==='\n') {
        imuPort.close();
        setInterval(exit, 100);
    }
});

process.stdin.on('end', () => {
    //process.stdout.write('end');
});

console.log(devicesInfo.imuPort);
const imuPort = new SerialPort(devicesInfo.imuPort, {
    baudRate: devicesInfo.imuBaudRate
});

imuPort.on('open', () => {
    console.log(`${devicesInfo.imuPort} is connected.`);
});

imuPort.on('close', () => {
    console.log(`${devicesInfo.imuPort} is disconnected.`);
});

let buffer=[];
let counter=0;
imuPort.on('data', function (data) {
	for (let b of data){
	     if (b===10) {
                 try{
                     let  r = JSON.parse(new Buffer(buffer).toString('ascii'));
                     console.log(`${r.roll}, ${r.pitch}, ${r.yaw}, ${r.dt}`);
                 }catch(ex){
                 }
                 buffer=[];
                 if (counter++===100){ 
                      console.log('-------------------------------------------------');
                      counter=0;
                 }
             } else {
                 buffer.push(b);
             }

	}
    //console.log('Data:', new Buffer(data).toString('ascii'));
});