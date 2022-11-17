import { ChatInputApplicationCommandData, AutocompleteInteraction, SlashCommandBuilder, Client } from 'discord.js';

type CommandExecute = (interaction: ChatInputApplicationCommandData) => Promise<any>;
type DB_Loader = (interaction: ChatInputApplicationCommandData) => Promise<void>;
type AutoCompleter = (interaction: AutocompleteInteraction) => Promise<void>;

interface Command {
  perm: 'member' | 'admin' | 'dev';
  data: SlashCommandBuilder;
  execute: CommandExecute;
  autocompleter: AutoCompleter;
}

export function init(client: Client): void;
