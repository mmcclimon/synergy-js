import { HubComponent } from '../hub-component';

export abstract class Channel extends HubComponent {
  constructor(arg) {
    super(arg);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  start(): void {}

  abstract sendMessage(addr: string, text: string): void;
}
