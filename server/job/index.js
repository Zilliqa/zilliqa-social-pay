const QueueEmitter = require('./emitter');

class QueueWorker {
  constructor(keys) {
    if (!Array.isArray(keys)) {
      throw new Error('keys should be Array');
    }

    this.jobQueues = keys.map((key) => new QueueEmitter(key));
  }

  _toMin() {
    this.jobQueues.sort((jobA, jobB) => {
      return jobA.queueLength - jobB.queueLength;
    });
  }

  distributeTasks(tasks) {
    if (!Array.isArray(tasks)) {
      throw new Error('tasks should be Array');
    }

    this._toMin();

    for (let taskIndex = 0; taskIndex < tasks.length + this.jobQueues.length; taskIndex += this.jobQueues.length) {
      for (let queueIndex = 0; queueIndex < this.jobQueues.length; queueIndex++) {
        const task = tasks[taskIndex + queueIndex];

        if (task) {
          this.jobQueues[queueIndex].addTask(task);
        }
      }
    }
  }
}

module.exports = {
  QueueWorker,
  QueueEmitter,
  Job: require('./job'),
  Queue: require('./queue')
};
