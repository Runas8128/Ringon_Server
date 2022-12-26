import { ActionRowBuilder, ButtonInteraction, ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions, Message } from "discord.js";

export type IndexModifier = (index: number) => number;

export = class View {
  index: number;

  update_message: (interaction: ButtonInteraction, modify_index: IndexModifier) => void;
  check_range: () => void;

  build_embed: () => EmbedBuilder;
  build_actionrow: () => ActionRowBuilder;

  get_updated_msg: () => InteractionReplyOptions;
  send: (interaction: ChatInputCommandInteraction) => Promise<Message>
}
