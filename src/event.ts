import Logger from './logger';
import User from './user';
import Channel from './channels/base';

export default class SynergyEvent {
  handled: boolean;
  isPublic: boolean;
  fromUser?: User;
  fromChannel: Channel;
  conversationAddress: string;
  wasTargeted: boolean;
  fromAddress: string;
  text: string;
  type: string;
  transportData: any;

  constructor({
    isPublic,
    fromUser = undefined,
    fromChannel,
    conversationAddress,
    wasTargeted,
    fromAddress,
    text,
    type,
    transportData,
  }) {
    this.isPublic = isPublic;
    this.fromUser = fromUser;
    this.fromChannel = fromChannel;
    this.conversationAddress = conversationAddress;
    this.wasTargeted = wasTargeted;
    this.fromAddress = fromAddress;
    this.text = text;
    this.type = type;
    this.handled = false;
  }

  reply(text, _alts?, _args?): void {
    Logger.debug(`sending ${text} to someone`);

    const prefix =
      this.fromUser && this.isPublic ? `${this.fromUser.username}: ` : '';

    text = prefix + text;

    // TODO: alts, editing
    this.fromChannel.sendMessage(this.conversationAddress, text);
  }

  markHandled(): void {
    this.handled = true;
  }
}
