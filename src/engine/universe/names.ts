import { GALAXY_NAMES } from "./constants";
import { pick, hashCombine, mulberry32 } from "./rng";
const PREFIX=["Aether","Avalon","Cynos","Draconis","Erebus","Helios","Khepri","Meridian","Nexus","Orion","Pegasus","Sagan","Tantalus","Vesper","Zeta"];
const SUFFIX=["Prime","Reach","Gate","Haven","Crown","Rift","Station","Delta","Vigil","Pulsar"];
const ROMAN=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX"];
export function galaxyName(index:number):string{return `${GALAXY_NAMES[index%GALAXY_NAMES.length]}${index>=GALAXY_NAMES.length?` ${Math.floor(index/GALAXY_NAMES.length)+1}`:""}`;}
export function systemName(seed:number|string,g:number,s:number):string{const r=mulberry32(hashCombine(seed,"system",g,s));return `${pick(r,PREFIX)}-${pick(r,SUFFIX)}-${String(g+1).padStart(2,"0")}${String(s+1).padStart(4,"0")}`;}
export function planetName(seed:number|string,g:number,s:number,p:number):string{return `${systemName(seed,g,s)} ${ROMAN[p%ROMAN.length]}`;}
