const { Message } = require('discord.js');

const Manager = require('../database');

module.exports = {
  name: 'messageCreate',
  once: false,
  /**
   * @param {Message} message
   */
  async execute(message) {
    if (message.author.bot) return;

    await Manager.load(async (loader) => {
      try {
        await loader();
        return true;
      }
      catch (err) { return false; }
    }, 'detect');
    const detect_result = Manager.detect.get_result(message.content);
    if (detect_result) {
      await message.channel.send(detect_result);
    }
  },
};
