module.exports = class Reactor {
  constructor(arg) {
    this.name = arg.name;
    this.hub = arg.hub;
  }

  start() {}

  get listenerSpecs() {
    return [];
  }

  listenersMatching(event) {
    return this.listenerSpecs.filter(l => l.predicate(event));
  }
};
