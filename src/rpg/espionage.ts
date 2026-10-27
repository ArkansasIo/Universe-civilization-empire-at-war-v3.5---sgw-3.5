export interface SpyReport { id:string; attackerId:string; defenderId:string; success:boolean; detected:boolean; resources?:Record<string,number>; fleetSummary?:Record<string,number>; createdAt:number; }
export interface EspionageState { ownerId:string; spies:number; counterIntelligence:number; }

export function espionageChance(spyLevel:number,targetLevel:number,counterIntelligence=0):number {
  return Math.max(0.05,Math.min(0.95,0.5+(spyLevel-targetLevel)*0.08-counterIntelligence*0.03));
}

export function conductEspionage(state:EspionageState, spyLevel:number,targetLevel:number,rng=Math.random,now=Date.now()):SpyReport {
  if(state.spies<1) throw new Error("no spy probe available");
  const chance=espionageChance(spyLevel,targetLevel,state.counterIntelligence);
  const success=rng()<chance;
  const detected=!success && rng()<0.35;
  return {id:`spy-${state.ownerId}-${now}`,attackerId:state.ownerId,defenderId:"target",success,detected,resources:success?{}:undefined,createdAt:now};
}
