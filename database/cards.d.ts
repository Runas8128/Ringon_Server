import { Database } from "../util/Notion";

export type CardType =
  '추종자' |
  '아뮬렛' |
  '카운트다운 아뮬렛' |
  '스펠';

export interface Card {
  page_id: string;
  card_id: number;
  name: string;
  cost: number;
  type: CardType;
  atk: number;
  life: number;
  desc: string;
  evo_atk: number;
  evo_life: number;
  evo_desc: string;
}

export interface CardPayload {
  card_id: number;
  card_name: string;
  cost: number;
  char_type: number;
  atk: number;
  life: number;
  disc: string;
  evo_atk: number;
  evo_life: number;
  evo_disc: string;
}

export = class Cards {
  id_map: { cards: string };
  db: Database;
  cards: Card[];

  load() : void;
}
