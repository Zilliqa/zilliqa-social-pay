const uuids = require('uuid');

module.exports = class Job {

  constructor(type, payload, ids, uuid) {
    if (!type) {
      throw new Error('type is required.');
    }

    this.type = type;
    this.payload = payload;
    this.ids = ids;

    if (uuid) {
      this.uuid = uuid;
    } else {
      this.uuid = uuids.v4();
    }
  }

}
