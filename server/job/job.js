const uuids = require('uuid');

const STATUSES = {
  inProgress: '@/job/in-progress',
  error: '@/job/got-error',
  done: '@/job/done',
  ready: '@/job/ready'
};

module.exports = class Job {

  constructor(name, payload, status = Job.statuses.ready) {
    this._statuses = STATUSES;

    if (!name) {
      throw new Error('name is required.');
    } else if (!status || !(status in Job.statuses)) {
      throw new Error('status is required.');
    }

    this.payload = payload;
    this.status = status;
    this.uuid = uuids.v4();
  }

}
