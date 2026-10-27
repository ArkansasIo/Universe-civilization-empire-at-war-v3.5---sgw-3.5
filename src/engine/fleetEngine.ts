import type { Coordinates, FleetOrderType } from './types';
export interface FleetCommand { fleetId:string; ownerId:string; order:FleetOrderType; from:Coordinates; to?:Coordinates; issuedAt:number; }
export function distance(a:Coordinates,b:Coordinates){return Math.abs(a.galaxy-b.galaxy)*10000+Math.abs(a.system-b.system)*100+Math.abs(a.planet-b.planet);}
export function travelSeconds(a:Coordinates,b:Coordinates,speed:number){if(speed<=0) throw new Error('INVALID_SPEED'); return Math.max(1,Math.ceil(distance(a,b)*3600/speed));}
export function canIssueFleetCommand(ownerId:string,command:FleetCommand){return ownerId===command.ownerId && command.fleetId.length>0;}
