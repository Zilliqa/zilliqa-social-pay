const uuids = require('uuid');
const { EventEmitter } = require('events');
const Job = require('./job');
const Queue = require('./queue');

const EVENTS = {
  taskAdded: uuids.v4(),
  taskError: uuids.v4(),
  taskDone: uuids.v4(),
  taskRestart: uuids.v4()
};

module.exports = class QueueEmitter extends EventEmitter {

  static events = EVENTS;

  constructor(name, settings = {}) {
    super();

    if (!name) {
      throw new Error('Queue no name.');
    }

    this.name = name;
    this.settings = settings;

    this.queue = new Queue();
  }

  addTask(task) {
    if (!(task instanceof Job)) {
      throw new Error('task should be instance of Job');
    }

    this.emit(QueueEmitter.events.taskAdded, task);

    return task;
  }
}
