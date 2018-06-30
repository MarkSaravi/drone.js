
var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyUSB0', {
  baudRate: 115200
});
console.log('hello');
port.on('open', function() {
    console.log('opening the port');
});
let buffer=[];
let counter=0;
port.on('data', function (data) {
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
