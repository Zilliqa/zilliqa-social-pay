const uuids = require('uuid');

module.exports = class Job {

  static statuses = {
    inProgress: '@/job/in-progress',
    error: '@/job/got-error',
    done: '@/job/done',
    ready: '@/job/ready'
  };

  constructor(name, payload, status = Job.statuses.ready) {
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
