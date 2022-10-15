const { Client } = require('@notionhq/client');
const { config, init } = require('./config');
init();

const notion = new Client({ auth: process.env.notion });

class Test {
  constructor() {
    this._a = 1;
    this.b = 2;
  }

  get a() {
    return this['_a'];
  }
  set a(val) {
    this._a = val;
  }
}

async function main() {
  console.log(new Test().a);
}

main();
