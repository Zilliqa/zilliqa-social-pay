const uuids = require('uuid');

module.exports = class Job {

  constructor(type, payload, uuid) {
    if (!type) {
      throw new Error('type is required.');
    }

    this.type = type;
    this.payload = payload;

    if (uuid) {
      this.uuid = uuid;
    } else {
      this.uuid = uuids.v4();
    }
  }

}
