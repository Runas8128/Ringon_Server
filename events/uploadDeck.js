const { MessageReaction, User, Message, EmbedBuilder } = require('discord.js');

const { config_common: { classes } } = require('../config');
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
      return this.origin.channel.send('시간 초과, 덱 등록을 취소합니다.');
    }

    const desc = await this.collect({
      prompt: ':ledger: 덱의 설명을 입력해주세요!',
      subprompt: '시간 제한 X\n덱 설명을 생략하려면 생략을 입력해주세요.',
    });

    this.upload(name, desc, 0);
  }

  async upload(name, desc, try_count) {
    while (Manager.loading.decklist) {
      if (try_count == 0) {
        await this.origin.channel.send('DB를 로드하는 중입니다. 잠시만 기다려주세요...');
      }
      await timer(100);
    }
    Manager.decklist.upload({
      name: name,
      clazz: this.origin.channel.name,
      desc: desc,
      author: this.origin.author.id,
      image_url: this.origin.attachments.first().url,
    })
      .then(() => this.origin.reply({
        content: '덱 등록을 성공적으로 마쳤습니다!',
        allowedMentions: {
          repliedUser: false,
        },
      }));
  }

  /**
    *  @param {object} payload
    *    @param {string} payload.prompt
    *    @param {string?} payload.subprompt
    *    @param {number?} payload.timeout
    */
  collect = ({ prompt, subprompt, timeout }) =>
    this.origin.reply({
      embeds: [buildEmbed(prompt, subprompt)],
      allowedMentions: { repliedUser: false },
    }).then(() => this.origin.channel.awaitMessages({
      filter: (msg) => msg.author.id == this.origin.author.id,
      max: 1,
      time: timeout,
    })).then(result => result.first()?.content);
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
      Object.keys(classes).includes(channel.name) &&
      reaction.emoji.id === classes[channel.name] &&
      user.id == message.author.id
    )) return;

    new DeckUploader(message).get_input();
  },
};

const buildEmbed = (prompt, subprompt) =>
  new EmbedBuilder()
    .setTitle(prompt)
    .setDescription(subprompt);

