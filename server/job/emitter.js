const uuids = require('uuid');
const { EventEmitter } = require('events');
const Queue = require('./queue');

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
    this.events = {
      trigger: uuids.v4()
    };
    this.queue = new Queue();
  }

  addTask(task) {
    this.queue.addTask(task);

    if (this.queue.firstJob) {
      setTimeout(() => this.emit(this.events.trigger, this.queue.firstTask), 0);
    }

    return task;
  }

  taskDone(task) {
    this.queue.removeTask(task);

    if (this.queue.hasJobs) {
      setTimeout(() => this.emit(this.events.trigger, this.queue.firstTask), 0);
    }

    return task;
  }

  next(task) {
    this.queue.moveToLast(task);

    if (this.queue.hasJobs) {
      setTimeout(() => this.emit(this.events.trigger, this.queue.firstTask), 0);
    }
  }
}
