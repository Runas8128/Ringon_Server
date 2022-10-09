const { Client, GatewayIntentBits, Intents } = require('discord.js');

const setup_event = require('../events');
const setup_commands = require('../commands');

class Bot {
  constructor() {
    this.token = process.env.discord;

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    setup_event(client);
    setup_commands(client, this.token);

    this.client = client;
  }

  login() {
    this.client.login(this.token);
  }
}

module.exports = new Bot();
