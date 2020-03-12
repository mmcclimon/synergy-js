import HubComponent from '../hub-component';

export default abstract class BaseReactor extends HubComponent {
  constructor(arg) {
    super(arg);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  start(): void {}
}
