const path = require('path');
const { Client, REST, Routes, PermissionFlagsBits } = require('discord.js');

const { config: { discord }, config_common: { commands } } = require('../config');
const { reply } = require('../util');
const logger = require('../util/Logger').getLogger(__filename);

const load_command = group => command_name => {
  const command = require(path.join(__dirname, group, command_name));

  if (command.perm == 'admin') {
    command.data
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }

  return command;
};

function load_commands() {
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

const deploy_commands = commandList =>
  new REST({ version: '10' })
    .setToken(process.env.discord)
    .put(
      Routes.applicationGuildCommands(discord.client, discord.guild),
      { body: commandList.map(command => command.data.toJSON()) },
    )
    .then(({ length }) => logger.info(`Successfully deployed ${length} commands.`))
    .catch(error => logger.error(`Something bad happened. ${error}`));

const add_command_listener = (client, commandList) =>
  client.on('interactionCreate', interaction => {
    logger.info(`Interaction created. name: ${interaction.commandName}`);

    if (
      !interaction.isChatInputCommand() &&
      !interaction.isAutocomplete()
    ) return;

    const command = commandList.find(cmd => cmd.data.name == interaction.commandName);
    (interaction.isAutocomplete() ? autocomplete : run_command)(command, interaction);
  });

/** @param {Client} client */
module.exports = client => {
  const commandList = load_commands();
  deploy_commands(commandList, process.env.discord);
  add_command_listener(client, commandList);
};

const autocomplete = (command, interaction) =>
  command?.autocompleter?.(interaction);

const run_command = (command, interaction) =>
  command?.execute?.(interaction)
    ?.catch(err => {
      reply(interaction, {
        content: `${interaction.commandName} 커맨드를 처리하는 동안 오류가 발생했습니다.`,
        ephemeral: true,
      });
      throw err;
    });
