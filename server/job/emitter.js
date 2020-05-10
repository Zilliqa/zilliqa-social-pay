const uuids = require('uuid');
const { EventEmitter } = require('events');
const Job = require('./job');
const Queue = require('./queue');

const EVENTS_TYPE = {
  taskAdded: uuids.v4(),
  taskError: uuids.v4(),
  taskDone: uuids.v4(),
  taskRestart: uuids.v4(),
  runJob: uuids.v4()
};

module.exports = class QueueEmitter extends EventEmitter {

  constructor(name, settings = {}) {
    super();

    if (!name) {
      throw new Error('Queue no name.');
    }

    this.name = name;
    this.settings = settings;

    this._queue = new Queue();
    this._events = EVENTS_TYPE;
  }

  addTask(task) {
    this._queue.addTask(task);
    this.emit(this._events.taskAdded, task);
    this.emit(this._events.runJob);

    return task;
  }

  taskDone(task) {
    this._queue.removeTask(task);
    this.emit(this._events.taskDone, task);
    this.emit(this._events.runJob);

    return task;
  }
}
