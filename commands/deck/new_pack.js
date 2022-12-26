const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ComponentType } = require('discord.js');

const { decklist } = require('../../database');

const noticeEmbed = new EmbedBuilder()
  .setTitle('⚠️ 해당 명령어 사용시, 현재 등록된 덱리가 모두 삭제됩니다.')
  .setDescription('사용하시려면 `확인`을 입력해주세요! 1분 후 자동으로 취소됩니다.');

/** @type {import('..').Command} */
module.exports = {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('팩이름')
    .setDescription('현재 팩 이름을 변경합니다.')
    .addStringOption(option => option
      .setName('이름')
      .setDescription('새로운 팩의 이름입니다.')
      .setRequired(true)),
  execute(interaction) {
    const checkID = `PackChecker_${Date.now()}`;

    interaction.reply({
      embeds: [noticeEmbed],
      components: [buildActionRow(checkID)],
    }).then(() => interaction.channel.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 60 * 1000,
      filter: ({ customId }) => checkID == customId,
    })).then(checker => checker.deferUpdate())
      .catch(err => interaction.editReply({ content: '팩 변경을 취소합니다.' }))
      .then(() => decklist.update_pack(
        interaction.options.getString('이름'),
        interaction.guild,
      ));
  },
};

const buildActionRow = customId =>
  new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(customId)
        .setLabel('확인'),
    );
