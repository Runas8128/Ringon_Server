import { AutocompleteInteraction, SlashCommandBuilder, Client, ChatInputCommandInteraction } from 'discord.js';

export type CommandExecute = (interaction: ChatInputCommandInteraction) => Promise<any>;
export type DB_Loader = (interaction: ChatInputCommandInteraction) => Promise<void>;
export type AutoCompleter = (interaction: AutocompleteInteraction) => Promise<void>;

export interface Command {
  perm: 'member' | 'admin' | 'dev';
  data: SlashCommandBuilder;
  execute: CommandExecute;
  autocompleter: AutoCompleter;
}

function setup_commands(client: Client): void;
export = setup_commands;
