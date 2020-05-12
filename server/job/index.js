const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'queueworker' });
const redis = require('redis');
const QueueEmitter = require('./emitter');
const REDIS_CONFIG = require('../config/redis')[process.env.NODE_ENV];

class QueueWorker {
  constructor(keys) {
    if (!Array.isArray(keys)) {
      throw new Error('keys should be Array');
    }

    this.jobQueues = keys.map((key) => new QueueEmitter(key));
    this.redisClient = redis.createClient(REDIS_CONFIG);

    this.redisClient.on('error', (err) => {
      log.error('redis:', err);
    });
    this.redisClient.on('message', (channel, message) => {
      log.info(channel, message);
    });
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

  addTask(taskJob) {
    for (let index = 0; index < this.jobQueues.length; index++) {
      const job = this.jobQueues[index];

      if (job.queue.hasTask(taskJob)) {
        return null;
      }
    }

    this._toMin();
    this.jobQueues[0].addTask(taskJob);
  }
}

module.exports = {
  QueueWorker,
  QueueEmitter,
  Job: require('./job'),
  Queue: require('./queue')
};
