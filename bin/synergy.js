const opt = require('commander');
const { Hub } = require('../dist/hub.js');

opt
  .requiredOption('-c, --config <file>', 'config file to use')
  .option('-q, --quiet', 'quiet mode, no logging')
  .parse(process.argv);

Hub.fromFile(opt.config).run();
