const path = require('path');
const { Client, REST, Routes, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

const { config: { discord }, config_common: { commands } } = require('../config');
const { reply } = require('../util');
const logger = require('../util/Logger').getLogger(__filename);

/**
 *  @callback CommandExecute
 *    @param {ChatInputCommandInteraction} interaction
 *    @returns {Promise<any>}
 *
 *  @callback DB_Loader
 *    @param {ChatInputCommandInteraction} interaction
 *    @returns {Promise<void>}
 *
 *  @callback AutoCompleter
 *    @param {AutocompleteInteraction} interaction
 *    @returns {Promise<void>}
 *
 *  @typedef Command
 *    @property {'member' | 'admin' | 'dev'} perm
 *    @property {SlashCommandBuilder} data
 *    @property {CommandExecute} execute
 *    @property {AutoCompleter?} autocompleter
 */

const load_command = group => command_name => {
  /** @type {Command} */
  const command = require(path.join(__dirname, group, command_name));

  if (command.perm == 'admin') {
    command.data
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }

  return command;
};

/**
 * @returns {Command[]}
 */
function load_commands() {
  /** @type {Command[]} */
  const commandList = [];
  logger.info('loading commands');

  Object.entries(commands)
    .forEach(([group, command_names]) => {
      const loader = load_command(group);
      command_names.forEach(command_name => commandList.push(loader(command_name)));
    });
  logger.info(`Successfully loaded ${commandList.length} commands.`);
  return commandList;
}

/**
 * @param {Command[]} commandList
 */
async function deploy_commands(commandList) {
  logger.info('deploying commands');

  try {
    const rest = new REST({ version: '10' }).setToken(process.env.discord);

    const data = await rest.put(
      Routes.applicationGuildCommands(discord.client, discord.guild),
      { body: commandList.map(command => command.data.toJSON()) },
    );
    logger.info(`Successfully deployed ${data.length} commands.`);
  }
  catch (error) {
    logger.error(`Something bad happened. ${error}`);
  }
}

/**
 * @param {Client} client
 * @param {Command[]} commandList
 */
const add_command_listener = (client, commandList) =>
  client.on('interactionCreate', async (interaction) => {
    logger.info(`Interaction created. name: ${interaction.commandName}`);

    if (
      !interaction.isChatInputCommand() &&
      !interaction.isAutocomplete()
    ) return;

    const command = commandList.find(cmd => cmd.data.name == interaction.commandName);
    (interaction.isAutocomplete() ? autocomplete : run_command)(command, interaction);
  });

module.exports = {
  /** @param {Client} client */
  init: (client) => {
    const commandList = load_commands();
    deploy_commands(commandList, process.env.discord);
    add_command_listener(client, commandList);
  },

  load_commands,
};

const autocomplete = (command, interaction) =>
  command?.autocompleter?.(interaction);

const run_command = (command, interaction) =>
  command?.execute?.(interaction)
    .catch(err => {
      reply(interaction, {
        content: `${interaction.commandName} 커맨드를 처리하는 동안 오류가 발생했습니다.`,
        ephemeral: true,
      });
      throw err;
    });
