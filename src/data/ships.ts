export type ShipClass = 'fighter' | 'corvette' | 'frigate' | 'destroyer' | 'cruiser' | 'battlecruiser' | 'battleship' | 'carrier' | 'mothership' | 'transport';

export interface ShipDefinition {
  id: string;
  name: string;
  race: 'asgard' | 'goauld' | 'replicator' | 'tauri' | 'common';
  class: ShipClass;
  hull: number;
  shields: number;
  armor: number;
  attack: number;
  cargo: number;
  speed: number;
  crew: number;
  technology: readonly string[];
}

export const SHIPS: readonly ShipDefinition[] = [
  { id: 'tauri-f302', name: 'F-302', race: 'tauri', class: 'fighter', hull: 15000, shields: 0, armor: 5000, attack: 4200, cargo: 20, speed: 120, crew: 1, technology: [] },
  { id: 'tauri-bc304', name: 'BC-304', race: 'tauri', class: 'battlecruiser', hull: 450000, shields: 350000, armor: 200000, attack: 85000, cargo: 5000, speed: 80, crew: 200, technology: ['hyperdrive'] },
  { id: 'goauld-hatak', name: "Ha'tak", race: 'goauld', class: 'mothership', hull: 1200000, shields: 950000, armor: 600000, attack: 220000, cargo: 10000, speed: 70, crew: 500, technology: ['hyperdrive'] },
  { id: 'asgard-battlecruiser', name: 'Asgard Battlecruiser', race: 'asgard', class: 'cruiser', hull: 800000, shields: 1200000, armor: 300000, attack: 240000, cargo: 6000, speed: 110, crew: 80, technology: ['hyperdrive', 'advanced-shields'] },
  { id: 'replicator-warship', name: 'Replicator Warship', race: 'replicator', class: 'battleship', hull: 1000000, shields: 500000, armor: 900000, attack: 210000, cargo: 7000, speed: 100, crew: 10, technology: ['hyperdrive'] },
] as const;
