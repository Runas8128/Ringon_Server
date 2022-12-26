import { APIEmbedField, ButtonBuilder, EmbedBuilder } from "discord.js";
import UpDownView from "./UpDownView";

export = class View extends UpDownView {
  base: EmbedBuilder;
  fields: APIEmbedField[];

  top: ButtonBuilder;
  up: ButtonBuilder;
  down: ButtonBuilder;
  bottom: ButtonBuilder;

  constructor(fields: APIEmbedField[]);
}
