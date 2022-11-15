const { Client, GatewayIntentBits, Partials } = require('discord.js');

const setup_event = require('../events');
const { init: setup_commands } = require('../commands');

class Bot {
  constructor() {
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
    setup_commands(client);

    this.client = client;
  }

  login() {
    if (process.env.testing) {
      this.client.login(process.env.discord);
      this.client.on('ready', ({ user }) => user.setPresence({
        status: 'dnd',
        activities: [{ name: '버그 수정' }],
      }));
    }
  }
}

module.exports = new Bot();
