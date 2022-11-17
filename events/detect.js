const { Message } = require('discord.js');

const { detect } = require('../database');

module.exports = {
  name: 'messageCreate',
  once: false,
  /**
   * @param {Message} message
   */
  execute(message) {
    if (message.author.bot) return;

    const detect_result = detect.get_result(message.content);
    if (detect_result) message.channel.send(detect_result);
  },
};
