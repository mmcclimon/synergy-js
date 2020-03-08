const util = require('util');
const http = require('superagent');
const WebSocket = require('ws');
const Logger = require('./logger.js');

const SlackClient = class {
  constructor(apiKey) {
    if (typeof apiKey === 'undefined') {
      throw new Error('No api key!');
    }

    this.apiKey = apiKey;
    this.ourName = null;
    this.ourId = null;
    this.teamData = null;
    this.ws = null;
    this.connected = false;
  }

  connect() {
    this.connected = false;

    return http
      .get('https://slack.com/api/rtm.connect')
      .query({ token: this.apiKey })
      .then(res => this._registerSlackRTM(res));
  }

  _registerSlackRTM(res) {
    const data = res.body;

    if (!data.ok) {
      throw new Error(`Couldn't connect to slack RTM: ${data.error}`);
    }

    Logger.info('Connected to Slack!');

    this.ourName = data.self.name;
    this.ourId = data.self.id;
    this.teamData = data.team;

    this.ws = new WebSocket(data.url);

    // set up ping
    this.ws.on('connection', () => {
      this.connected = true;
    });

    const interval = setInterval(() => this.ws.ping(), 10000);
    this.ws.on('close', () => clearInterval(interval));
  }

  setUp() {}
};

module.exports = SlackClient;
