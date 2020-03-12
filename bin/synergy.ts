import * as opt from 'commander';
import { Hub } from '../src/hub';

opt
  .requiredOption('-c, --config <file>', 'config file to use')
  .option('-q, --quiet', 'quiet mode, no logging')
  .parse(process.argv);

Hub.fromFile(opt.config).run();
