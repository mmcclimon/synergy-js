import HubComponent from './hub-component';

// this is a singleton
export default class Commando {
  private static specs: Map<
    typeof HubComponent,
    Record<string, any>
  > = new Map();

  static staticDispatch = {};

  static registerListener(name, spec): void {
    const klass = spec.klass;
    if (!this.specs.has(klass)) {
      this.specs.set(klass, {});
    }
    this.specs.get(klass)[name] = spec;
  }

  static dispatch(event): void {
    const [word] = event.text.split(/\s+/, 2);
    let handler;

    if ((handler = this.staticDispatch[word])) {
      handler(event);
    }
  }

  static reifyCommandsOn(reactor: HubComponent): void {
    const specs = this.specs.get(reactor.constructor as typeof HubComponent);
    if (!specs) return;

    for (const [name, spec] of Object.entries(specs)) {
      this.staticDispatch[name] = spec.handler.bind(reactor);
    }
  }
}
