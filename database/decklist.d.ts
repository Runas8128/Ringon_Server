import { EmbedBuilder, Guild, TextChannel } from "discord.js";
import { Block, Database, PropertyPayload } from "../util/Notion";

export interface Deck {
  page_id: string;
  deck_id: number;
  name: string;
  clazz: string;
  desc: string;
  author: string;
  image_url: string;
  timestamp: string;
  version: number;
}

export interface Contrib {
  DeckID: number;
  ContribID: string;
}

export interface DeckUpdateInfo {
  guild: Guild;
  id: number;
  updater: string;
  desc: string?;
  image_url: string?;
}

export = class DeckList {
  id_map: { list: string, contrib: string, pack: string };
  list_db: Database;
  contrib_db: Database;
  pack_block: Block;

  decklist: Deck[];
  contrib: Contrib[];
  history: TextChannel;

  update_pack: (new_pack: string, guild: Guild) => void;
  _delete_deck: (guild: Guild) => (deck: str) => void;
  update_deck: (param: DeckUpdateInfo) => void;
  make_deck_embed: (deck: Deck, guild: Guild) => EmbedBuilder;

  upload: (deck: Deck) => void;

  load: () => void;
  propertify: (deck: Deck) => PropertyPayload;
}
