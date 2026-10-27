import type { Coordinates } from "./galaxy.js";
import { distance } from "./galaxy.js";
export type MissionType="transport"|"colonize"|"attack"|"defend"|"spy"|"recycle"|"expedition"|"moonAttack";
export interface SpaceMission { id:string; type:MissionType; ownerId:string; fleetId:string; from:Coordinates; to:Coordinates; departureAt:number; arrivalAt:number; returnAt?:number; status:"scheduled"|"outbound"|"arrived"|"returning"|"complete"|"cancelled"; }
export interface MissionSpeedProfile { speed:number; fuelPerDistance:number; }
export function travelTimeMs(from:Coordinates,to:Coordinates,speed:number):number { if(speed<=0)throw new Error("speed must be positive"); return Math.max(1000,Math.ceil(distance(from,to)/speed*3_600_000)); }
export function createMission(input:Omit<SpaceMission,"arrivalAt"|"status"> & {speed:number}):SpaceMission { const {speed,...base}=input; return {...base,arrivalAt:input.departureAt+travelTimeMs(input.from,input.to,speed),status:"scheduled"}; }
export function updateMission(m:SpaceMission,now:number):SpaceMission { if(m.status==="scheduled"&&now>=m.departureAt)return {...m,status:"outbound"}; if(m.status==="outbound"&&now>=m.arrivalAt)return {...m,status:"arrived"}; if(m.status==="returning"&&m.returnAt&&now>=m.returnAt)return {...m,status:"complete"}; return m; }
