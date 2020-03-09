const fromConfig = function(registry, hub, name, config) {
  const constructor = registry[config.class];

  if (!constructor) throw new Error(`no class for reactor ${name}!`);

  return new constructor({
    hub: hub,
    name: name,
    ...config,
  });
};

module.exports = {
  fromConfig: fromConfig,
};
