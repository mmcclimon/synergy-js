const fs = require('fs');
const SlackChannel = require('./channels/slack.js');
const UserDirectory = require('./user-directory.js');

module.exports = class SynergyHub {
  // alternate constructor
  static fromFile(filename) {
    const config = JSON.parse(fs.readFileSync(filename));
    return new SynergyHub(config);
  }

  constructor(config) {
    this.config = config; // todo
    this.channels = [];
    this.reactors = [];

    this.userDirectory = new UserDirectory(config);

    this.registerChannel({});
  }

  run() {
    this.channels.forEach(channel => channel.start());
  }

  registerChannel(args) {
    // for now, just a slack channel
    this.channels.push(new SlackChannel(this.config.slackApiToken));
  }
};
