const Job = require('./job');

module.exports = class Queue {

  get hasJobs() {
    return this.queue.length > 0;
  }

  get firstJob() {
    return this.queue.length === 1;
  }

  get firstTask() {
    return this.queue[0];
  }

  constructor() {
    this.queue = new Array();
  }

  _testTask(task) {
    if (!(task instanceof Job)) {
      throw new Error('task should be instance of Job');
    }
  }
  
  addTask(task) {
    this._testTask(task);

    const existed = this.queue.some((el) => el.uuid === task.uuid);

    if (existed) {
      throw new Error('Such task id already exist');
    }

    this.queue.push(task);

    return task;
  }

  removeTask(task) {
    this._testTask(task);
    this.queue = this.queue.filter((el) => el.uuid !== task.uuid);
  }
}
