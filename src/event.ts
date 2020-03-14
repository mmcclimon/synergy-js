import Logger from './logger';
import User from './user';
import Channel from './channels/base';

export default class SynergyEvent {
  private _handled: boolean;
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
    this._handled = false;
  }

  get handled(): boolean {
    return this._handled;
  }

  reply(text, arg?: { handle: boolean }): void {
    Logger.debug(`sending ${text} to someone`);

    const prefix =
      this.fromUser && this.isPublic ? `${this.fromUser.username}: ` : '';

    text = prefix + text;

    // TODO: alts, editing
    this.fromChannel.sendMessage(this.conversationAddress, text);

    const shouldHandle = arg && arg.handle ? arg.handle : true;

    if (shouldHandle) {
      this._handled = true;
    }
  }
}
