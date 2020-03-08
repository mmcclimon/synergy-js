const fs = require('fs');
const Logger = require('./logger.js');
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

  async run() {
    await this.userDirectory.isReady();
    this.channels.forEach(channel => channel.start());
  }

  registerChannel(args) {
    // for now, just a slack channel
    const slack = new SlackChannel({
      hub: this,
      name: 'slack_fm',
      apiToken: this.config.slackApiToken
    });

    this.channels.push(slack);
  }

  handleEvent(event) {
    Logger.info(`handling event: ${event.text}`);
  }
};
