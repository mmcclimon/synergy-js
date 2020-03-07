const fs = require('fs');

const opt = require('commander');
const slack = require('../src/SlackClient.js');

opt
  .requiredOption('-c, --config <file>', 'config file to use')
  .option('-q, --quiet', 'quiet mode, no logging')
  .parse(process.argv);

const config = JSON.parse(fs.readFileSync(opt.config));

const client = new slack(config.slackApiToken);
client.connect();
