export interface Stargate { id:string; planetId:string; address:string; active:boolean; cooldownUntil:number; }
export function validateAddress(address:string){return /^[A-Z0-9]{6,9}$/.test(address);}
export function canDial(gate:Stargate,target:Stargate,now=Date.now()){if(!gate.active||!target.active) return false; if(!validateAddress(target.address)) return false; return gate.cooldownUntil<=now;}
export function dial(gate:Stargate,target:Stargate,now=Date.now(),cooldownMs=60_000){if(!canDial(gate,target,now)) throw new Error('GATE_UNAVAILABLE'); return {...gate,cooldownUntil:now+cooldownMs};}
