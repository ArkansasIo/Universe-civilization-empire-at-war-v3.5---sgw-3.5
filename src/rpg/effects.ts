import { clamp, finiteNonNegative } from "./rules.js";
import type { ActiveEffect, CleanseType, Combatant, EffectDefinition } from "./types.js";
const ccCategories=new Set(["stun","freeze","root","silence","fear","charm","sleep","knockdown","knockback"]);
export class EffectSystem {
  apply(target:Combatant, definition:EffectDefinition, sourceId?:string):ActiveEffect|undefined {
    if ((target.immunities??[]).some(tag=>(definition.grantsImmunity??[]).includes(tag)) ||
      (definition.ccDiminishingCategory && target.effects.some(e=>e.definition.ccDiminishingCategory===definition.ccDiminishingCategory && e.remainingSeconds>0 && e.stacks>=4))) return;
    const duration=finiteNonNegative(definition.durationSeconds,"effect duration");
    const existing=target.effects.find(e=>e.definition.id===definition.id);
    if(existing) {
      switch(definition.stackMode) {
        case "none": return existing;
        case "refresh": existing.remainingSeconds=duration; existing.stacks=1; return existing;
        case "addStacks": existing.stacks=Math.min(definition.maxStacks??1,existing.stacks+1); existing.remainingSeconds=duration; return existing;
        case "replaceStronger": if(Math.abs(definition.magnitude)>Math.abs(existing.definition.magnitude)) existing.definition=definition; existing.remainingSeconds=duration; return existing;
        case "independent": break;
      }
    }
    let durationScale=1;
    if(definition.ccDiminishingCategory && ccCategories.has(definition.ccDiminishingCategory)) {
      const recent=target.effects.filter(e=>e.definition.ccDiminishingCategory===definition.ccDiminishingCategory && e.remainingSeconds>0).length;
      durationScale=[1,.5,.25,0][Math.min(3,recent)]??0;
      if(durationScale===0)return;
    }
    const finalDefinition=durationScale===1?definition:{...definition,durationSeconds:duration*durationScale};
    const effect:ActiveEffect={definition:finalDefinition,stacks:1,remainingSeconds:finalDefinition.durationSeconds,sourceId,elapsedForTick:0};
    target.effects.push(effect);
    return effect;
  }
  tick(target:Combatant,deltaSeconds:number):Array<{effectId:string;damage:number;healing?:number}> {
    const delta=clamp(finiteNonNegative(deltaSeconds),0,60), events:Array<{effectId:string;damage:number;healing?:number}>=[];
    for(const effect of target.effects) {
      const before=effect.remainingSeconds;
      effect.remainingSeconds=Math.max(0,before-delta);
      effect.elapsedForTick=(effect.elapsedForTick??0)+delta;
      const interval=effect.definition.tickSeconds;
      if(interval && interval>0) {
        while((effect.elapsedForTick??0)>=interval && before>0) {
          effect.elapsedForTick=(effect.elapsedForTick??0)-interval;
          const amount=Math.max(0,effect.definition.magnitude*effect.stacks);
          const hp=target.stats.resources.hp;
          if(effect.definition.category==="dot" && hp && target.alive) {
            const dealt=Math.min(hp.current,amount); hp.current-=dealt;
            events.push({effectId:effect.definition.id,damage:dealt});
            if(hp.current<=0)target.alive=false;
          } else if(effect.definition.id==="regeneration" && hp && target.alive) {
            const healed=Math.min(hp.max-hp.current,amount); hp.current+=healed;
            events.push({effectId:effect.definition.id,damage:0,healing:healed});
          }
        }
      }
    }
    target.effects=target.effects.filter(e=>e.remainingSeconds>0);
    return events;
  }
  cleanse(target:Combatant,type:CleanseType):number {
    const before=target.effects.length;
    target.effects=target.effects.filter(e=>!(type==="all"||e.definition.cleanseType===type));
    return before-target.effects.length;
  }
  snapshot(target:Combatant):ActiveEffect[] { return target.effects.map(e=>({...e,definition:{...e.definition}})); }
}
