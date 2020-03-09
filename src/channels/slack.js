const { sprintf } = require('sprintf-js');

const Channel = require('./base.js');
const SlackClient = require('../slack-client.js');
const Logger = require('../logger.js');
const Event = require('../event.js');

module.exports = class SlackChannel extends Channel {
  constructor(arg) {
    super(arg);
    this.slack = new SlackClient(arg.apiToken);
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
        this.handleMessage(slackEvent);
        break;
      default:
        // do nothing
        return;
    }
  }

  handleMessage(slackEvent) {
    if (!this.slack.isReady) {
      Logger.info('ignoring Slack message; slack client not fully set up');
      return;
    }

    if (slackEvent.subtype) {
      // TODO: do respond to /me messages
      Logger.info(`ignoring slack event with subtype ${slackEvent.subtype}`);
      return;
    }

    if (slackEvent.bot_id) return;

    const event = this.synergyEventFromSlackEvent(slackEvent);
    if (!event) {
      Logger.warn(
        sprintf(
          "couldn't convert a %s/%s message to channel %s, dropping it",
          slackEvent.type,
          slackEvent.subtype ? slackEvent.subType : '[none]',
          slackEvent.channel
        )
      );
      return;
    }
    this.hub.handleEvent(event);
  }

  synergyEventFromSlackEvent(slackEvent) {
    const privateAddr = slackEvent.channel.startsWith('G')
      ? slackEvent.channel
      : this.slack.dmChannelForAddress(slackEvent.user);

    if (!privateAddr) return;

    const fromUser = this.hub.userDirectory.userByChannelAndAddress(
      this.name,
      slackEvent.user
    );

    let text = this.decodeSlackFormatting(slackEvent.text);
    let wasTargeted = false;

    if (!this._targetedRegex) {
      const me = this.slack.ourName;
      this._targetedRegex = new RegExp(`^@?(${me})(?=\\W):?\\s*`, 'i');
    }

    if (this._targetedRegex.test(text)) {
      text = text.replace(this._targetedRegex, '');
      wasTargeted = true;
    }

    // Only public channels public.
    // Everything is targeted if it's sent in direct message.
    const isPublic = /^C/.test(slackEvent.channel);
    if (/^D/.test(slackEvent.channel)) {
      wasTargeted = true;
    }

    return new Event({
      type: 'message',
      text: text,
      wasTargeted: wasTargeted,
      isPublic: isPublic,
      fromChannel: this,
      fromAddress: slackEvent.user,
      fromUser: fromUser,
      transportData: slackEvent,
      conversationAddress: slackEvent.channel,
    });
  }

  decodeSlackFormatting(text) {
    const usernameFor = id => this.slack.username(id);

    // Usernames: <@U123ABC>
    text = text.replace(/<@(U[A-Z0-9]+)>/g, (_, $1) => '@' + usernameFor($1));

    // Channels: <#C123ABC|bottest>
    text = text.replace(/<#[CD](?:[A-Z0-9]+)\|(.*?)>/g, (_, $1) => '#' + $1);

    // mailto: mailto:foo@bar.com|foo@bar.com (no surrounding brackets)
    text = text.replace(/mailto:\S+?\|/g, '');

    // "helpful" url formatting:  <https://example.com|example.com>; keep what
    // user actually typed
    text = text.replace(/<([^>]+)>/g, (_, $1) => $1.replace(/^.*\|/, ''));

    // Anything with < and > around it is probably a URL at this point so remove
    // those
    text = text.replace(/[<>]/g, '');

    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&amp;/g, '&');

    return text;
  }

  sendMessage(target, text) {
    text = text.replace(/</g, '&lt;');
    text = text.replace(/>/g, '&gt;');
    text = text.replace(/&/g, '&amp;');

    this.slack.sendMessage(target, text);
  }
};
