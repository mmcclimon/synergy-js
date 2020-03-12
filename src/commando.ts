import {
  Listener,
  Reactor,
  ReactorConstructor,
  ReactorHandler,
} from './reactors';

type ListenerSpec = Record<string, Listener>;

// this is a singleton
export default class Commando {
  private static specs: Map<ReactorConstructor, ListenerSpec> = new Map();
  private static staticDispatch: Record<string, ReactorHandler> = {};

  static registerListener(name: string, spec: Listener): void {
    const klass = spec.klass;

    if (!this.specs.has(klass)) {
      this.specs.set(klass, {});
    }

    this.specs.get(klass)[name] = spec;
  }

  // TODO: dynamic dispatch
  static dispatch(event): void {
    const [command] = event.text.split(/\s+/, 2);

    const handler = this.staticDispatch[command];

    if (handler) {
      handler(event);
    }
  }

  static reifyCommandsOn(reactor: Reactor): void {
    const specs = this.specs.get(reactor.constructor as ReactorConstructor);
    if (!specs) return;

    for (const [name, spec] of Object.entries(specs)) {
      this.staticDispatch[name] = spec.handler.bind(reactor);
    }
  }
}
