import Logger from './logger';
import SynergyEvent from './event';
import {
  Listener,
  Reactor,
  ReactorConstructor,
  ReactorHandler,
} from './reactors';

type ListenerSpec = Record<string, Listener>;
type DynamicMatcher = {
  predicate: (e: SynergyEvent) => boolean;
  handler: ReactorHandler;
};

// this is a singleton
export default class Commando {
  private static specs: Map<ReactorConstructor, ListenerSpec> = new Map();
  private static staticDispatch: Record<string, ReactorHandler> = {};
  private static dynamicMatchers: Array<DynamicMatcher> = [];

  static registerListener(name: string, spec: Listener): void {
    const klass = spec.klass;

    if (!this.specs.has(klass)) {
      this.specs.set(klass, {});
    }

    spec.aliases = spec.aliases || [];

    this.specs.get(klass)[name] = spec;
  }

  static dispatch(event): void {
    const [command] = event.text.split(/\s+/, 2);

    // maybe, match both dynamically and statically, but I think this is
    // probably not backward compatible with existing synergy commands
    const staticHandler = this.staticDispatch[command];

    if (staticHandler) {
      return staticHandler(event);
    }

    return this.dispatchDynamic(event);
  }

  static dispatchDynamic(event: SynergyEvent): void {
    const hits = [];

    for (const matcher of this.dynamicMatchers) {
      if (matcher.predicate(event)) {
        hits.push(matcher.handler);
      }
    }

    if (hits.length > 1) Logger.verbose('todo: exclusive detection');

    hits.forEach(handler => handler(event));

    return;
  }

  static reifyCommandsOn(reactor: Reactor): void {
    const specs = this.specs.get(reactor.constructor as ReactorConstructor);
    if (!specs) return;

    for (const [name, spec] of Object.entries(specs)) {
      const bound = spec.handler.bind(reactor);

      if (spec.match || spec.passive) {
        // if the listener has a match(), we will not put that in static
        const predicate = this.generateDynamicMatcher(spec);

        this.dynamicMatchers.push({
          predicate: predicate,
          handler: bound,
        });
      } else {
        // if it doesn't, we'll put it and all of its aliases statically
        this.staticDispatch[name] = bound;

        spec.aliases.forEach(alias => {
          this.staticDispatch[alias] = bound;
        });
      }
    }
  }

  static generateDynamicMatcher(spec: Listener): (e: SynergyEvent) => boolean {
    type Match = RegExp | ((e: SynergyEvent) => boolean);

    const requireTargeted = !!spec.passive;
    const match: Match = spec.match || ((): boolean => true);

    const pred = function(e: SynergyEvent): boolean {
      if (requireTargeted && !e.wasTargeted) {
        return false;
      }

      return typeof match === 'function' ? match(e) : match.test(e.text);
    };

    return pred;
  }
}
