const { Client } = require('@notionhq/client');
const { config, init } = require('./config');
init();

const notion = new Client({ auth: process.env.notion });

async function main() {
  let pages;
  let start_cursor;
  const data = [];

  do {
    pages = await notion.databases.query({
      database_id: config.id.notion.deck.list,
      start_cursor: start_cursor,
    });
    pages.results.forEach((result) => {
      data.push(result);
    });
    start_cursor = pages.next_cursor;
  } while (pages.has_more);

  const { clazz, name } = data[0].properties;

  console.log(clazz.select.name);
  console.log(name.title[0].plain_text);
}

main();
