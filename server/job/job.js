const uuids = require('uuid');

module.exports = class Job {

  constructor(name, payload, type) {
    if (!name) {
      throw new Error('name is required.');
    } else if (!type) {
      throw new Error('type is required.');
    }

    this.payload = payload;
    this.type = type;
    this.uuid = uuids.v4();
  }

}
