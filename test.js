require('./config').init();

async function main() {
  require('./util/Bot').login();
}

main();
