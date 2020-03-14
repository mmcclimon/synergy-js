import * as repl from 'repl';
import * as chalk from 'chalk';

import BaseChannel from './base';
import SynergyEvent from '../event';
import Logger from '../logger';

export default class ConsoleChannel extends BaseChannel {
  fromAddress: string;
  defaultPublicReplyAddr: string;

  constructor(arg) {
    super(arg);
    this.fromAddress = arg.fromAddress || 'sysop';
    this.defaultPublicReplyAddr = arg.defaultPublicReplyAddr || '#public';
  }

  start(): void {
    const handler = this.handleInput.bind(this);
    repl.start({ prompt: chalk.cyan('synergy> '), eval: handler });
  }

  handleInput(text: string, ctx, _, doneCb): void {
    const evt = new SynergyEvent({
      type: 'message',
      text: text.trim(),
      wasTargeted: true,
      isPublic: false,
      fromChannel: this,
      fromAddress: this.fromAddress,
      fromUser: this.hub.userDirectory.resolveName(this.fromAddress),
      transportData: ctx,
      conversationAddress: this.defaultPublicReplyAddr,
    });

    this.hub.handleEvent(evt);
    doneCb(null);
  }

  sendMessage(addr: string, text: string): void {
    const indented = text.replace(/\n/g, '\n  ');
    console.log(chalk.magenta(`>> ${this.name}!${addr} |\n  ${indented}`));
  }
}
