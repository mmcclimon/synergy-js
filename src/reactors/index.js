const HubComponent = require('../hub-component.js');

const REGISTRY = {
  EchoReactor: require('./echo.js')
};

const fromConfig = function() {
  return HubComponent.fromConfig(REGISTRY, ...arguments);
};

module.exports = {
  fromConfig: fromConfig
};
