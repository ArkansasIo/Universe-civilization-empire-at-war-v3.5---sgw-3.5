import type { DamageType, StatModifier, StatusEffectDefinition } from './types';

export type AbilityTarget='self'|'ally'|'enemy'|'area';
export type AbilityDefinition={id:string;name:string;description:string;school:string;damageType?:DamageType;target:AbilityTarget;power:number;coefficient:number;resourceCost:number;cooldownMs:number;castMs:number;range:number;effects?:string[];tags:string[]};
export const abilities:AbilityDefinition[]=[
{id:'basic-attack',name:'Basic Attack',description:'A reliable weapon strike.',school:'martial',damageType:'physical',target:'enemy',power:20,coefficient:1,resourceCost:0,cooldownMs:800,castMs:0,range:2,effects:[],tags:['basic']},
{id:'power-strike',name:'Power Strike',description:'Heavy melee attack with a chance to stagger.',school:'martial',damageType:'physical',target:'enemy',power:60,coefficient:1.4,resourceCost:20,cooldownMs:6000,castMs:0,range:2,effects:['shattered-armor'],tags:['melee','control']},
{id:'fireball',name:'Fireball',description:'Ranged arcane fire projectile.',school:'elemental',damageType:'fire',target:'enemy',power:90,coefficient:1.6,resourceCost:30,cooldownMs:4000,castMs:1200,range:30,effects:['burning'],tags:['ranged','magic']},
{id:'renew',name:'Renew',description:'Restores an ally over time.',school:'divine',target:'ally',power:80,coefficient:1.1,resourceCost:35,cooldownMs:7000,castMs:900,range:25,effects:['regeneration'],tags:['heal']},
{id:'shadow-step',name:'Shadow Step',description:'Move behind an enemy and empower the next attack.',school:'rogue',target:'enemy',power:40,coefficient:1,resourceCost:25,cooldownMs:10000,castMs:0,range:20,effects:['power-surge'],tags:['mobility','stealth']},
{id:'battle-command',name:'Battle Command',description:'Increase allied offensive output.',school:'commander',target:'area',power:0,coefficient:0,resourceCost:30,cooldownMs:20000,castMs:500,range:15,effects:['power-surge'],tags:['group','buff']},
{id:'shield-wall',name:'Shield Wall',description:'Temporarily reinforce defenses.',school:'defense',target:'self',power:0,coefficient:0,resourceCost:30,cooldownMs:30000,castMs:0,range:0,effects:['fortified'],tags:['defensive']},
{id:'interrupt',name:'Interrupt',description:'Interrupt a telegraphed cast.',school:'martial',target:'enemy',power:15,coefficient:.3,resourceCost:10,cooldownMs:12000,castMs:0,range:8,effects:['stunned'],tags:['interrupt','control']},
];

export const effectModifiers:Record<string,StatModifier[]>={
  'power-surge':[{stat:'attackPower',mode:'percent',value:.2}],
  fortified:[{stat:'armor',mode:'percent',value:.25}],
  'shattered-armor':[{stat:'armor',mode:'percent',value:-.08}],
};

export function getAbility(id:string):AbilityDefinition|undefined{return abilities.find(a=>a.id===id);}
export function getEffect(id:string):StatusEffectDefinition|undefined{return undefined;}
