const { Client } = require('@notionhq/client');
const { config, init } = require('./config');
init();

const notion = new Client({ auth: process.env.notion });

async function main() {
  const result = await notion.blocks.retrieve({
    block_id: config.id.notion.deck.pack,
  });
  console.log(result.paragraph.rich_text[0].plain_text);
}

main();
