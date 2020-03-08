const SlackChannel = require('./slack.js');

const REGISTRY = {
  SlackChannel: SlackChannel
};

const fromConfig = function(hub, name, config) {
  const constructor = REGISTRY[config.class];

  if (!constructor) throw new Error(`no class for channel ${name}!`);

  return new constructor({
    hub: hub,
    name: name,
    ...config
  });
};

module.exports = {
  fromConfig: fromConfig
};
