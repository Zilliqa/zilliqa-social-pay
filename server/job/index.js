const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'queueworker' });
const redis = require('redis');

const QueueEmitter = require('./emitter');
const Job = require('./job');
const JOB_TYPES = require('../config/job-types');

const ENV = process.env.NODE_ENV || 'development';
const REDIS_CONFIG = require('../config/redis')[ENV];

class QueueWorker {
  constructor(keys) {
    if (!Array.isArray(keys)) {
      throw new Error('keys should be Array');
    } else if (keys.length === 0) {
      throw new Error('keys is emnty.');
    }

    this.jobQueues = keys.map((key) => new QueueEmitter(key));
    this._redisSubscribe = redis.createClient(REDIS_CONFIG.url);
    this._redisSubscribe.subscribe(REDIS_CONFIG.channels.TX_HANDLER);

    this._redisSubscribe.on('error', (err) => {
      log.error('redis:', err);
    });
    this._redisSubscribe.on('message', (channel, message) => {
      try {
        let payload = {};
        let type = null;
        const body = JSON.parse(message);

        switch (body.type) {
          case JOB_TYPES.configureUsers:
            payload.userId = body.userId;
            type = body.type;
            break;
          case JOB_TYPES.verifyTweet:
            payload.userId = body.userId;
            payload.tweetId = body.tweetId;
            type = body.type;
            break;
          default:
            return null;
        }

        const job = new Job(type, payload);

        this.addTask(job);
      } catch (err) {
        log.error('channel:', channel, 'message', message, 'error', err);
      }
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
  Job,
  Queue: require('./queue')
};
