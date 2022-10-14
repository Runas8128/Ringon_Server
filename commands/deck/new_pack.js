const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ComponentType } = require('discord.js');

const { decklist } = require('../../database');

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
    const timestamp = Date.now();

    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('⚠️ 해당 명령어 사용시, 현재 등록된 덱리가 모두 삭제됩니다.')
        .setDescription('사용하시려면 `확인`을 입력해주세요! 1분 후 자동으로 취소됩니다.'),
      ],
      components: [new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`PackChecker_${timestamp}`)
            .setLabel('확인'),
        ),
      ],
    });

    try {
      const checker = await interaction.channel.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 60 * 1000,
        filter: (button) => button.customId == `PackChecker_${timestamp}`,
      });

      await checker.deferUpdate();
      await decklist.update_pack(
        interaction.options.getString('이름'),
        interaction.guild,
      );
    }
    catch (err) {
      await interaction.editReply({
        content: '팩 변경을 취소합니다.',
      });
    }
  },
  database: [decklist],
};
