const https = require('https');
const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Logger = require('../../util/Logger');

const logger = Logger.getLogger(__filename);

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('포탈링크')
    .setDescription('유효한 덱 코드를 입력하면, 해당 포탈로 가는 링크를 제공합니다!')
    .addStringOption(option =>
      option.setName('덱코드').setDescription('포탈 링크를 만들 덱 코드입니다.').setRequired(true)),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();
    const deck_code = interaction.options.getString('덱코드');

    // GET 'https://shadowverse-portal.com/api/v1/deck/import'
    // params={'format': 'json', 'deck_code': deck_code}
    // data = resp.json().data

    https.get(
      `https://shadowverse-portal.com/api/v1/deck/import?format=json&deck_code=${deck_code}`,
      (resp) => {
        let rst = '';

        resp.on('data', (chunk) => {
          rst += chunk;
        });
        resp.on('error', (err) => {
          logger.error(err);
        });
        resp.on('end', async () => {
          const deck_json = JSON.parse(rst).data;
          if (Object.keys(deck_json.errors).length > 0) {
            await interaction.editReply(
              '덱 코드가 무효하거나, 잘못 입력되었습니다. 다시 입력해 주시기 바랍니다.',
            );
          }
          else {
            const row = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setLabel('포탈 링크')
                  .setStyle(ButtonStyle.Link)
                  .setURL(`https://shadowverse-portal.com/deck/${deck_json.hash}?lang=ko`),
              );
            await interaction.editReply({ components: [row] });
          }
        });
      },
    ).end();
  },
};
