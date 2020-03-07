// TODO: lots
const slack = require('../src/SlackClient.js');

const client = new slack(process.env.SLACK_API_TOKEN);
client.connect();
