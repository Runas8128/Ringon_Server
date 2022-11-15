const { Message, TextChannel } = require('discord.js');

const { config_common: { classes } } = require('../config');

module.exports = {
  name: 'messageCreate',
  once: false,
  /**
   * @param {Message} message
   */
  async execute(message) {
    if (!(
      !message.author.bot &&
      message.attachments.size > 0 &&
      message.channel instanceof TextChannel &&
      message.channel.parent?.name === 'Lab' &&
      Object.keys(classes).includes(message.channel.name)
    )) return;

    message.react(classes[message.channel.name]);
  },
};
