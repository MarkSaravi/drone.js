const EventEmitter = require('events');
class EventHandler extends EventEmitter { }
const eventHandler = new EventHandler();

module.exports.eventHandler = eventHandler;