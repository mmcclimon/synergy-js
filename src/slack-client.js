const util = require('util');
const http = require('superagent');
const WebSocket = require('ws');
const Logger = require('./logger.js');

const intoObject = function(arr, key, val) {
  return arr.reduce((acc, el) => {
    const k = el[key];
    const v = val ? el[val] : el;
    acc[k] = v;
    return acc;
  }, {});
};

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
    this.isReady = false;

    this.users = null;
    this.channels = null;
    this.dmChannels = null;
    this.groupConversations = null;
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

  setUp() {
    Logger.info('Connected to Slack!');
    this.loadUsers();
    this.loadChannels();
    this.loadGroupConversations();
    this.loadDMs();
    this.isReady = true;
  }

  _apiUrl(method) {
    return `https://slack.com/api/${method}`;
  }

  get _apiAuthHeader() {
    return `Bearer ${this.apiKey}`;
  }

  apiCall(method, data) {
    let postType = 'json';

    if (data._formEncoded) {
      delete data._formEncoded;
      postType = 'form';
    }

    return http
      .post(this._apiUrl(method))
      .type(postType)
      .set('Authorization', this._apiAuthHeader)
      .send(data)
      .then(res => {
        if (res.error) {
          return Promise.reject(
            `error talking to slack during method ${method}: ${res.text}`
          );
        }

        return Promise.resolve(res.body);
      });
  }

  async loadUsers() {
    const data = await this.apiCall('users.list', { presence: false });
    this.users = intoObject(data.members, 'id');

    // fix up ourselves, because sometimes the name isn't right.
    this.users[this.ourId].name = this.ourName;

    Logger.info('Slack users loaded');
  }

  async loadChannels() {
    const data = await this.apiCall('conversations.list', {
      _formEncoded: true,
      excludeArchived: true,
      types: 'public_channel'
    });

    this.channels = intoObject(data.channels, 'id');
    Logger.info('Slack channels loaded');
  }

  async loadGroupConversations() {
    const data = await this.apiCall('conversations.list', {
      _formEncoded: true,
      types: 'mpim,private_channel'
    });

    this.groupConversations = intoObject(data.channels, 'id');
    Logger.info('Slack group conversations loaded');
  }

  async loadDMs() {
    const data = await this.apiCall('conversations.list', {
      _formEncoded: true,
      excludeArchived: true,
      types: 'im'
    });

    this.dmChannels = intoObject(data.channels, 'user', 'id');
    Logger.info('Slack DM channels loaded');
  }

  async dmChannelForAddress(slackId) {
    let channelId = this.dmChannels[slackId];
    if (channelId) return channelId;

    // we don't have it...get it!
    const data = await this.apiCall('convesations.open', { users: slackId });

    channelId = data.ok
      ? data.channel.id
      : data.error === 'cannot_dm_bot'
      ? null
      : '0E0';

    if (channelId && channelId === '0E0') {
      Logger.info(`weird error from slack: ${JSON.stringify(data)}`);
      return;
    }

    // don't look it up again
    this.dmChannels[slackId] = channelId;
    return channelId;
  }

  username(id) {
    return this.users[id].name;
  }
};

module.exports = SlackClient;
