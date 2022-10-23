const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');
const { ChannelManager, Message, User, EmbedBuilder } = require('discord.js');

const { config } = require('../../config');

/**
 * @param {string} URL
 * @param {ChannelManager} channel_manager
 */
function parseURL(URL, channel_manager) {
  if (!URL.includes('discord.com/channels')) return null;

  const url_part = URL.slice('/');
  url_part.splice(0, url_part.length - 2);
  const [channel_id, message_id] = url_part;

  const channel = channel_manager.cache.get(channel_id);
  if (!(channel && channel.isTextBased())) return null;

  const message = channel.messages.cache.get(message_id);
  if (!message) return null;

  return message;
}

/**
 * @param {Message} message
 * @param {string[]} indi_emojis
 * @param {User[]} all_members
 */
function collect_reaction(message, indi_emojis, all_members) {
  const result = {
    'other': [],
    'none': [],
  };
  indi_emojis.forEach((emoji) => result[emoji] = []);

  message.reactions.cache.forEach((reaction) => {
    const emoji = reaction.emoji.name;
    reaction.users.fetch().then((users) => {
      users.forEach((user) => {
        if (all_members.includes(user)) {
          all_members.splice(all_members.indexOf(user), 1);
          (result[emoji] || result.other).push(user);
        }
      });
    });
  });
  result.none = all_members;
  return result;
}

module.exports = {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('인원점검')
    .setDescription('특정 공지의 반응을 분석합니다.')
    .addStringOption(option =>
      option.setName('url').setDescription('대상 공지의 메시지 링크입니다.').setRequired(true))
    .addStringOption(option =>
      option.setName('emoji').setDescription('개별적으로 체크할 이모지들입니다. 공백으로 구분해 적어주시면 됩니다.')),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const URL = interaction.options.getString('url');
    const message = parseURL(URL, interaction.client.channels);
    if (!message) {
      await interaction.reply('올바른 메시지 링크를 입력해주세요.');
      return;
    }

    const indi_emoji = interaction.options.getString('emoji') || '👍 👎 ';
    const all_member = await interaction.guild.members.cache.filter(user =>
      user.roles.cache.has(config.discord.role.all));
    const result = collect_reaction(message, indi_emoji.split(' '), all_member);

    const embed = new EmbedBuilder()
      .setTitle('반응 분석 결과')
      .setDescription(`대상 공지: ${URL}`);
    Object.keys(result).forEach((emoji) => {
      let name = emoji;
      if (name == 'other') name = '그 외';
      else if (name == 'none') name = '반응 안함';

      embed.addFields({
        name: name,
        value: result[emoji].join(', '),
      });
    });
    await interaction.reply({ embeds: [embed] });
  },
};
