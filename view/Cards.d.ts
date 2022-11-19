import { ButtonBuilder } from "discord.js";
import { Card } from "../database/cards";
import UpDownView from "./UpDownView";

export = class View extends UpDownView {
  cards: Card[];
  prev: ButtonBuilder;
  next: ButtonBuilder;

  constructor(cards: Card[]);
}
