const { Client, GatewayIntentBits, Partials } = require('discord.js');

const setup_event = require('../events');
const { init: setup_commands } = require('../commands');
const { config_common } = require('../config');

class Bot {
  constructor() {
    this.token = process.env.discord;

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
      ],
      partials: [
        Partials.Reaction,
        Partials.Message,
      ],
    });
    setup_event(client);
    setup_commands(client, this.token);

    this.client = client;
  }

  login() {
    this.client.login(this.token);

    this.client.on('ready', () => {
      if (config_common.is_testing) {
        this.client.user.setPresence({
          status: 'dnd',
          activities: [{ name: '버그 수정' }],
        });
      }
    });
  }
}

module.exports = new Bot();
