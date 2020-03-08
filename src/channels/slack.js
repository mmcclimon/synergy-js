const Channel = require('../channel.js');
const SlackClient = require('../slack-client.js');

module.exports = class SlackChannel extends Channel {
  constructor(apiKey) {
    super();
    this.slack = new SlackClient(apiKey);
  }

  async start() {
    await this.slack.connect();
    this.slack.ws.on('message', data => this.handleFrame(data));
  }

  handleFrame(data) {
    if (!data) return;

    const slackEvent = JSON.parse(data);

    switch (slackEvent.type) {
      case 'hello':
        this.slack.setUp();
        break;
      case 'message':
        console.log(data);
        break;
      default:
        // do nothing
        return;
    }
  }
};
