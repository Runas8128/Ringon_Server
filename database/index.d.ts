import Cards from "./cards";
import DeckList from "./decklist";
import Detect from "./detect"

export = class Manager {
  detect: Detect;
  decklist: DeckList;
  cards: Cards;
  
  loading: { detect: boolean, decklist: boolean, cards: boolean };
  load: (DB: 'detect'|'decklist'|'cards') => void;
  load_all: () => void;
}