const Logger = require('./logger.js');

module.exports = class Event {
  constructor(arg) {
    Object.assign(this, arg); // ha, terrible.
    this.handled = false;
  }

  reply(text, alts, args) {
    Logger.debug(`sending ${text} to someone`);

    const prefix = this.fromUser && this.isPublic
      ? `${this.fromUser.username}: `
      : '';

    text = prefix + text;

    // TODO: alts, editing
    this.fromChannel.sendMessage(this.conversationAddress, text);
  }

  markHandled() {
    this.handled = true;
  }
};
