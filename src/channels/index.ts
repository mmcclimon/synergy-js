const HubComponent = require('../hub-component.js');

const REGISTRY = {
  SlackChannel: require('./slack.js'),
};

const fromConfig = function() {
  return HubComponent.fromConfig(REGISTRY, ...arguments);
};

module.exports = {
  fromConfig: fromConfig,
};
