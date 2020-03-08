const fs = require('fs');

const opt = require('commander');
const hub = require('../src/hub.js');

opt
  .requiredOption('-c, --config <file>', 'config file to use')
  .option('-q, --quiet', 'quiet mode, no logging')
  .parse(process.argv);

hub.fromFile(opt.config).run();
