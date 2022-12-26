import { ButtonBuilder, ButtonInteraction, Guild } from "discord.js";
import { Deck } from "../database/decklist";
import UpDownView from "./UpDownView";

export = class View extends UpDownView {
  decks: Deck[];
  guild: Guild;

  prev: ButtonBuilder;
  menu: ButtonBuilder;
  next: ButtonBuilder;
  delete: ButtonBuilder;

  constructor(decks: Deck[], guild: Guild);

  open_menu: (i: ButtonInteraction) => Promise<void>;
  _delete: (i: ButtonInteraction) => Promise<void>;
}
