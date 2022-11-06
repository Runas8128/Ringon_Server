const { MessageReaction, User, Message, EmbedBuilder, MessageMentions } = require('discord.js');

const { config_common } = require('../config');
const Manager = require('../database');
const { timer } = require('../util');

class DeckUploader {
  /**
   * @param {Message} origin
   */
  constructor(origin) {
    this.origin = origin;
  }

  async get_input() {
    const name = await this.collect({
      prompt: ':ledger: 덱의 이름을 입력해주세요!',
      subprompt: '시간 제한: 1분',
      timeout: 60 * 1000,
    });
    if (name === undefined) {
      await this.origin.channel.send('시간 초과, 덱 등록을 취소합니다.');
      return;
    }

    const desc = await this.collect({
      prompt: ':ledger: 덱의 설명을 입력해주세요!',
      subprompt: '시간 제한 X\n덱 설명을 생략하려면 생략을 입력해주세요.',
    });

    await this.upload(name, desc, 0);
  }

  async upload(name, desc, try_count) {
    if (Manager.loading.decklist) {
      if (try_count == 0) {
        await this.origin.channel.send('DB를 로드하는 중입니다. 잠시만 기다려주세요...');
      }
      await timer(100);
      await this.upload(name, desc, try_count + 1);
    }
    else {
      await Manager.decklist.upload({
        name: name,
        clazz: this.origin.channel.name,
        desc: desc,
        author: this.origin.author.id,
        image_url: this.origin.attachments.first().url,
      });
      await this.origin.reply({
        content: '덱 등록을 성공적으로 마쳤습니다!',
        allowedMentions: {
          repliedUser: false,
        },
      });
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

    await this.origin.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    const result = await this.origin.channel.awaitMessages({
      filter: (msg) => msg.author.id == this.origin.author.id,
      max: 1,
      time: timeout,
    });

    return result.first()?.content;
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

    await new DeckUploader(message).get_input();
  },
};
