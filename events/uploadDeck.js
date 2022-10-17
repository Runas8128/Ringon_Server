const { MessageReaction, User, Message, EmbedBuilder } = require('discord.js');

const { config_common } = require('../config');

class DeckUploader {
  /**
   * @param {Message} origin
   */
  constructor(origin) {
    this.origin = origin;
  }

  async try_upload() {
    try {
      const name = await this.collect({
        prompt: ':ledger: 덱의 이름을 입력해주세요!',
        subprompt: '시간 제한: 1분',
        timeout: 60 * 1000,
      });

      const desc = await this.collect({
        prompt: ':ledger: 덱의 설명을 입력해주세요!',
        subprompt: '시간 제한 X\n덱 설명을 생략하려면 생략을 입력해주세요.',
      });
    }
    catch (error) {
      await this.origin.channel.send('시간 초과, 덱 등록을 취소합니다.');
    }
  }

  /**
    *  @param {object} payload
    *    @param {string} payload.prompt
    *    @param {string?} payload.subprompt
    *    @param {number?} payload.timeout
    */
  async collect({ prompt, subprompt, timeout }) {
    const embed = new EmbedBuilder().setTitle(prompt);
    if (subprompt) embed.setDescription(subprompt);

    const result = await this.origin.channel.awaitMessages({
      filter: (msg) => msg.author.id == this.origin.id,
      max: 1,
      time: timeout,
    });

    return result.first().content;
  }
}

module.exports = {
  name: 'messageReactionAdd',
  once: false,
  /**
   * @param {MessageReaction} reaction
   * @param {User} user
   */
  async execute(reaction, user) {
    const channel = reaction.message.channel;

    let message = reaction.message;
    if (message.partial) message = await message.fetch();

    if (!(
      Object.keys(config_common.classes).includes(channel.name) &&
      reaction.emoji.id === config_common.classes[channel.name] &&
      user.id == message.author.id
    )) return;

    await new DeckUploader(message).try_upload();
  },
};
