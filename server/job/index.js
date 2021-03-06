const bunyan = require('bunyan');
const _ = require('lodash');
const log = bunyan.createLogger({ name: 'queueworker' });
const redis = require('redis');

const QueueEmitter = require('./emitter');
const Job = require('./job');

const ENV = process.env.NODE_ENV || 'development';
const REDIS_CONFIG = require('../config/redis')[ENV];

class QueueWorker {

  get jobsLength() {
    let length = 0;

    for (let index = 0; index < this.jobQueues.length; index++) {
      const element = this.jobQueues[index];

      length += element.queueLength;
    }

    return length;
  }

  get _minimalQueue() {
    const listOfLength = this.jobQueues.map((q) => q.queueLength);
    const minLenght = Math.min.apply(Math, listOfLength);
    const foundIndex = listOfLength.findIndex((n) => n === minLenght);

    return this.jobQueues[foundIndex];
  }

  constructor(keys) {
    if (!Array.isArray(keys)) {
      throw new Error('keys should be Array');
    } else if (keys.length === 0) {
      throw new Error('keys is emnty.');
    }

    this.jobQueues = keys.map((key) => new QueueEmitter(key));
    this.redisSubscribe = redis.createClient(REDIS_CONFIG.url);
    this.redisSubscribe.subscribe(REDIS_CONFIG.channels.TX_HANDLER);
    this.padding = false;

    this.redisSubscribe.on('error', (err) => {
      log.error('redis:', err);
    });
  }

  _toMin() {
    this.jobQueues.sort((jobA, jobB) => {
      return jobA.queueLength - jobB.queueLength;
    });
  }

  _toRandom() {
    this.jobQueues.sort(() => {
      return 0.5 - Math.random();
    });
  }

  _checkUnique(task) {
    for (let index = 0; index < this.jobQueues.length; index++) {
      const job = this.jobQueues[index].queue;

      for (let jobIndex = 0; jobIndex < job.queue.length; jobIndex++) {
        const queue = job.queue[jobIndex];

        for (let idIndex = 0; idIndex < task.ids.length; idIndex++) {
          const id = task.ids[idIndex];

          if (queue.ids.includes(id)) {
            throw new Error('Job must be unique');
          }
        }
      }
    }
  }

  distributeTasks(tasks) {
    if (!Array.isArray(tasks)) {
      throw new Error('tasks should be Array');
    } else if (tasks.length === 0) {
      return null;
    }

    this._toRandom();
    this.padding = true;

    for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
      try {
        const task = tasks[taskIndex];

        this._checkUnique(task);
        this._minimalQueue.addTask(task);
      } catch (err) {
        continue;
      }
    }

    this.jobQueues.forEach((job) => {
      log.info('JOB', job.name, 'queue:', job.queueLength);
    });

    this.padding = false;
    this._toRandom();
  }

  addTask(taskJob) {
    try {
      this._toRandom();
      this._toMin();

      this.jobQueues[0].addTask(taskJob);
      log.info('JOB added', this.jobQueues[0].name, 'queue:', this.jobQueues[0].queueLength);
    } catch (err) {
      log.warn('JOB has in queue.', err);
    }
  }

  addJobQueues(key) {
    if (!key) {
      throw new Error('Key is required');
    }

    const job = new QueueEmitter(key);

    this.jobQueues.push(job);

    this.jobQueues.forEach((job) => {
      log.info('JOB', job.name, 'queue:', job.queueLength);
    });

    return job;
  }
}

module.exports = {
  QueueWorker,
  QueueEmitter,
  Job,
  Queue: require('./queue')
};
