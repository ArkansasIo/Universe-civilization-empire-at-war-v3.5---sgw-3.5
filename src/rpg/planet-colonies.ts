import type { ResourceWallet } from "./space-economy.js";
import type { Coordinates } from "./galaxy.js";

export interface Colony { id:string; ownerId:string; name:string; coordinates:Coordinates; fields:number; usedFields:number; population:number; resources:ResourceWallet; capital:boolean; moonId?:string; }
export interface ColonizationRule { maxColonies:number; colonyShipCost:ResourceWallet; minimumFreeFields:number; }

export const DEFAULT_COLONIZATION_RULE:ColonizationRule = { maxColonies:9, colonyShipCost:{metal:10_000,crystal:20_000,deuterium:10_000,naquadah:0,energy:0,darkMatter:0}, minimumFreeFields:100 };

export function canColonize(colonies:Colony[], ownerId:string, rule=DEFAULT_COLONIZATION_RULE):boolean { return colonies.filter(c=>c.ownerId===ownerId).length < rule.maxColonies; }
export function createColony(ownerId:string,name:string,coordinates:Coordinates,capital=false,fields=163):Colony { return {id:`planet-${ownerId}-${coordinates.galaxy}-${coordinates.system}-${coordinates.position}`,ownerId,name,coordinates,fields,usedFields:1,population:100,capital,resources:{metal:500,crystal:300,deuterium:100,naquadah:0,energy:0,darkMatter:0}}; }
export function freeFields(colony:Colony):number { return Math.max(0,colony.fields-colony.usedFields); }
export function canBuild(colony:Colony, fields=1):boolean { return freeFields(colony)>=fields; }
export function occupyFields(colony:Colony, fields=1):Colony { if(!canBuild(colony,fields)) throw new Error("planet has insufficient free fields"); return {...colony,usedFields:colony.usedFields+fields}; }
