const uuids = require('uuid');
const { EventEmitter } = require('events');
const Queue = require('./queue');

const EVENTS_TYPE = () => ({
  taskAdded: uuids.v4(),
  taskError: uuids.v4(),
  taskDone: uuids.v4(),
  taskRestart: uuids.v4(),
  trigger: uuids.v4()
});

module.exports = class QueueEmitter extends EventEmitter {

  get queueLength() {
    return this.queue.length;
  }

  constructor(name, settings = {}) {
    super();

    if (!name) {
      throw new Error('Queue no name.');
    }

    this.name = name;
    this.settings = settings;
    this.events = EVENTS_TYPE();
    this.queue = new Queue();
  }

  addTask(task) {
    this.queue.addTask(task);
    this.emit(this.events.taskAdded, task);

    if (this.queue.firstJob) {
      this.emit(this.events.trigger, this.queue.firstTask);
    }

    return task;
  }

  taskDone(task) {
    this.queue.removeTask(task);
    this.emit(this.events.taskDone, task);

    if (this.queue.hasJobs) {
      this.emit(this.events.trigger, this.queue.firstTask);
    }

    return task;
  }

  next(task) {
    this.queue.moveToLast(task);
    this.emit(this.events.trigger, this.queue.firstTask);
  }
}
