const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');
const { ChannelManager, Message, User, EmbedBuilder } = require('discord.js');

const { config } = require('../../config');

module.exports = {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('인원점검')
    .setDescription('특정 공지의 반응을 분석합니다.')
    .addStringOption(option =>
      option.setName('url').setDescription('대상 공지의 메시지 링크입니다.'))
    .addStringOption(option =>
      option.setName('id').setDescription('대상 공지의 메시지 ID입니다.'))
    .addStringOption(option =>
      option.setName('emoji').setDescription('개별적으로 체크할 이모지들입니다. 공백으로 구분해 적어주시면 됩니다.')),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const channels = interaction.client.channels;
    const getOpt = opt => interaction.options.getString(opt);

    const messagePromise = parseURL(getOpt('url'), channels) ?? parseID(getOpt('id'), channels);
    if (!messagePromise) {
      return interaction.reply('올바른 메시지 링크를 입력해주세요.');
    }
    const message = await messagePromise;

    const indi_emoji = interaction.options.getString('emoji') || '👍 👎';
    const all_member = Array.from(interaction.guild.members.cache
      .filter(user => user.roles.cache.has(config.discord.role.all))
      .values());
    const result = await collect_reaction(message, indi_emoji.split(' '), all_member);

    const embed = new EmbedBuilder()
      .setTitle('반응 분석 결과')
      .setDescription(`대상 공지: ${message.url}`);

    Object.keys(result).forEach(emoji =>
      embed.addFields({
        name: emoji == 'other' ? '그 외' : emoji == 'none' ? '반응 안함' : emoji,
        value: result[emoji].join(', ') || '없음',
      })
    );
    interaction.reply({ embeds: [embed] });
  },
};

/**
 * @param {Message} message
 * @param {string[]} indi_emojis
 * @param {User[]} all_members
 */
async function collect_reaction(message, indi_emojis, all_members) {
  const result = {};
  indi_emojis.forEach(emoji => result[emoji] = []);
  result.other = [];

  await Promise.all(message.reactions.cache
    .map(async reaction => {
      const emoji = indi_emojis.includes(reaction.emoji) ? reaction.emoji : 'other';
      const users = await reaction.users.fetch();

      users.forEach(user => {
        const index = all_members.findIndex(({ id }) => id == user.id);
        if (index != -1) {
          result[emoji].push(all_members.splice(index, 1));
        }
      });
    })
  );

  result.none = all_members;
  return result;
}

/**
 * @param {string} URL
 * @param {ChannelManager} channel_manager
 */
function parseURL(URL, channel_manager) {
  if (!URL?.includes?.('discord.com/channels')) return null;

  const url_part = URL.split('/');
  url_part.splice(0, url_part.length - 2);
  const [channel_id, message_id] = url_part;

  const getMessage = messageGetter(channel_manager);

  return getMessage(channel_id, message_id);
}

/**
 * @param {string} ID
 * @param {ChannelManager} channel_manager
 */
function parseID(ID, channel_manager) {
  const { main_notice: main_id, event_notice: event_id } = config.discord.channel;
  
  const getMessage = messageGetter(channel_manager);
  return getMessage(main_id, ID) ?? getMessage(event_id, ID);
}

/**
 * @param {ChannelManager} channel_manager
 */
const messageGetter = channel_manager => (channel_id, message_id) => {
  const channel = channel_manager.cache.get(channel_id);
  if (!(channel && channel.isTextBased())) return null;

  return channel.messages.fetch(message_id);
}
