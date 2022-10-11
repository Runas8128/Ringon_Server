const { Client } = require('@notionhq/client');
const { config, init } = require('./config');
init();

const notion = new Client({ auth: process.env.notion });

async function main() {
  const str = 'Hello #hash world';
  const hash_regex = /#(\w+)/g;
  const idx = str.match(hash_regex);
  console.log(idx);
}

main();
