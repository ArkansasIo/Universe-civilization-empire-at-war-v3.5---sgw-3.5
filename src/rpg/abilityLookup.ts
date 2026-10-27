import type { AbilityDefinition, } from './abilities';
import type { StatusEffectDefinition } from './types';
import { abilities } from './abilities';
import { statusEffects } from './catalog';
export const getAbility=(id:string):AbilityDefinition|undefined=>abilities.find(a=>a.id===id);
export const getEffect=(id:string):StatusEffectDefinition|undefined=>statusEffects.find(e=>e.id===id);
