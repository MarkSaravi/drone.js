///<reference path="../node_modules/@types/node/index.d.ts" />
import Application from './application/Application';
import PortInfo from './models/PortInfo';
import FlightController from './application/FlightController';
const readline = require('readline');
import IFlightConfig from './models/IFlightConfig';
const config: IFlightConfig = require('config.json')('./config.flight.json');
const portsConfig = require('config.json')('./config.ports.json');


const flightControl = new FlightController(config);
let app = new Application(flightControl, config);

app.on('ble-send', (s) => {
    app.writeBLE(s);
});

app.start();
app.emit('start-application', portsConfig.ports);

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on('keypress', (str, key) => {
    // console.log(`${str}, ${JSON.stringify(key)} ---------------------------`)
    switch (key.sequence) {
        case '\u001b[A':
            app.emit('tilt-forward');
            // Up
            break;

        case '\u001b[B':
            app.emit('tilt-backward');
            // Down
            break;

        case '\u001b[C':
            app.emit('tilt-right');
            // Right
            break;

        case '\u001b[D':
            app.emit('tilt-left');
            // Left
            break;
    }
    switch (str) {
        case '.':
            app.emit('turn-right');
            // Right
            break;
        case ',':
            app.emit('turn-left');
            // Left
            break;
        case 'q':
        case 'Q':
            app.emit('stopping-application');
            break;

        case ']':
            app.emit('inc-p-gain');
            break;
        case '[':
            app.emit('dec-p-gain');
            break;

        case '\'':
            app.emit('inc-i-gain');
            break;
        case ';':
            app.emit('dec-i-gain');
            break;

        case 'l':
        case 'L':
            app.emit('inc-d-gain');
            break;
        case 'k':
        case 'K':
            app.emit('dec-d-gain');
            break;
            
        case 'a':
        case 'A':
            app.emit('inc-power');
            break;

        case 'z':
        case 'Z':
            app.emit('dec-power');
            break;

        case 'p':
        case 'P':
            app.emit('toggle-p');
            break;

        case 'i':
        case 'I':
            app.emit('toggle-i');
            break;

        case 'd':
        case 'D':
            app.emit('toggle-d');
            break;
    }

});
