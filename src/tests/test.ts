import TestRunner from './TestRunner';
import IFlightConfig from '../models/IFlightConfig';

const config: IFlightConfig = require('config.json')('./config.flight.json');

const runner = new TestRunner();

runner.test('config', () => {
    console.log(`minPower: ${JSON.stringify(config)}`);
});

