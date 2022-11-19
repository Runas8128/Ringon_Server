import { Client } from 'discord.js';

export type EventExecute = (...args: any[]) => void;

export interface Event {
  name: string;
  once: boolean;
  execute: EventExecute
}

function setup_event(client: Client): void;

export = setup_event;
