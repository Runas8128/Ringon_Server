const { SlashCommandBuilder, ChatInputCommandInteraction, ButtonStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ComponentType } = require('discord.js');

const { decklist } = require('../../database');
const { reply } = require('../../util');
const Logger = require('../../util/Logger');

const logger = Logger.getLogger(__filename);

module.exports = {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('팩이름')
    .setDescription('현재 팩 이름을 변경합니다.')
    .addStringOption(option =>
      option.setName('이름').setDescription('새로운 팩의 이름입니다.').setRequired(true)),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await reply(interaction, {
      embeds: [new EmbedBuilder()
        .setTitle('⚠️ 해당 명령어 사용시, 현재 등록된 덱리가 모두 삭제됩니다.')
        .setDescription('사용하시려면 `확인`을 입력해주세요! 1분 후 자동으로 취소됩니다.'),
      ],
    });

    try {
      await interaction.channel.awaitMessages({
        time: 60 * 1000,
        filter: msg => msg.author.id === interaction.user.id && msg.content === '확인',
      });

      interaction.followUp('승인되었습니다! 덱리 초기화 및 팩이름 변경을 실행합니다...');

      decklist.update_pack(
        interaction.options.getString('이름'),
        interaction.guild,
      );
    }
    catch (err) {
      reply(interaction, {
        content: '팩 변경을 취소합니다.',
      });
    }
  },
};
