const path = require('path');
const { Client, REST, Routes, PermissionFlagsBits, SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');

const { config, config_common } = require('../config');
const { reply } = require('../util');
const logger = require('../util/logger').getLogger(__filename);

/**
 *  @callback CommandExecute
 *    @param {ChatInputCommandInteraction} interaction
 *    @returns {Promise<any>}
 *
 *  @callback DB_Loader
 *    @param {ChatInputCommandInteraction} interaction
 *    @returns {Promise<void>}
 *
 *  @typedef Database
 *    @property {DB_Loader} load
 *
 *  @typedef Command
 *    @property {'member' | 'admin' | 'dev'} perm
 *    @property {SlashCommandBuilder} data
 *    @property {CommandExecute} execute
 *    @property {Database[]?} database
 */

/**
 * @returns {Command[]}
 */
function load_commands() {
  /** @type {Command[]} */
  const commands = [];

  logger.info('loading commands');
  for (const [group, command_names] of Object.entries(config_common.commands)) {
    for (const command_name of command_names) {
      /**
       *  @type {Command}
       */
      const command = require(path.join(__dirname, group, command_name));
      if (command.perm == 'admin') {
        command.data.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
      }
      commands.push(command);
    }
  }
  logger.info(`Successfully loaded ${commands.length} commands.`);
  return commands;
}

/**
 * @param {Command[]} commands
 * @param {string} token
 */
async function deploy_commands(commands, token) {
  logger.info('deploying commands');

  try {
    const rest = new REST({ version: '10' }).setToken(token);
    const { client, guild } = config.id.discord;

    const data = await rest.put(
      Routes.applicationGuildCommands(client, guild),
      { body: commands.map(command => command.data.toJSON()) },
    );
    logger.info(`Successfully deployed ${data.length} commands.`);
  }
  catch (error) {
    logger.error(`Something bad happened. ${error}`);
  }
}

/**
 * @param {Client} client
 * @param {Command[]} commands
 */
function add_command_listener(client, commands) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    /**
     * @type {Command?}
     */
    const command = commands.find((cmd) => cmd.data.name == interaction.commandName);
    if (!command) return;

    try {
      if (command.database) {
        await interaction.deferReply();
        for (let i = 0; i < command.database.length; i++) {
          await command.database[i].load(interaction);
        }
      }
      await command.execute(interaction);
    }
    catch (error) {
      await reply(interaction, {
        content: `${interaction.commandName} 커맨드를 처리하는 동안 오류가 발생했습니다.`,
        ephemeral: true,
      });
      console.log(error);
    }
  });
}

/**
 * @param {Client} client
 * @param {string} token
 */
module.exports = (client, token) => {
  const commands = load_commands();
  deploy_commands(commands, token);
  add_command_listener(client, commands);
};
