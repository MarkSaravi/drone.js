///<reference path="../node_modules/@types/node/index.d.ts" />

import {EventEmitter} from 'events';

export default class Application extends EventEmitter {
    constructor() {
        super();
    }

    greeting(name: String) {
        console.log(`Greeting ${name}`);
    }
}
