const uuids = require('uuid');
const { EventEmitter } = require('events');
const Queue = require('./queue');

const EVENTS_TYPE = {
  taskAdded: uuids.v4(),
  taskError: uuids.v4(),
  taskDone: uuids.v4(),
  taskRestart: uuids.v4(),
  trigger: uuids.v4()
};

module.exports = class QueueEmitter extends EventEmitter {

  constructor(name, settings = {}) {
    super();

    if (!name) {
      throw new Error('Queue no name.');
    }

    this.name = name;
    this.settings = settings;
    this.events = EVENTS_TYPE;
    this.inProcessing = false;

    this._queue = new Queue();
  }

  addTask(task) {
    this._queue.addTask(task);
    this.emit(this.events.taskAdded, task);

    if (this._queue.firstJob) {
      this.emit(this.events.trigger, this._queue.firstTask);
    }

    return task;
  }

  taskDone(task) {
    this._queue.removeTask(task);
    this.emit(this.events.taskDone, task);

    if (this._queue.hasJobs) {
      this.emit(this.events.trigger, this._queue.firstTask);
    }

    return task;
  }
}
