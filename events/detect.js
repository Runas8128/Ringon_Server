const { Message } = require('discord.js');
const { detect } = require('../database');

module.exports = {
  name: 'messageCreate',
  once: false,
  /**
   * @param {Message} message
   */
  async execute(message) {
    const detect_result = detect.get_result(message.content);
    if (detect_result) {
      await message.channel.send(detect_result);
    }
  },
};
