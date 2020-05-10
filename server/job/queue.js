const Job = require('./job');

module.exports = class Queue {

  queue = new Set();

  constructor() { }
  
  addTask(task) {
    if (!(task instanceof Job)) {
      throw new Error('task should be instance of Job');
    }

    this.queue.forEach((taskJob) => {
      if (taskJob.uuid === task.uuid) {
        throw new Error('Such task id already exist');
      }
    });

    this.queue.add(task);

    return task;
  }
}
