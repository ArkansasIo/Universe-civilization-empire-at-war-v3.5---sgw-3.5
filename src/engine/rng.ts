export function hashSeed(seed:string):number { let h=2166136261; for(const c of seed){h^=c.charCodeAt(0); h=Math.imul(h,16777619);} return h>>>0; }
export function mulberry32(seed:number){ return () => { let t=seed+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; }; }
export function seededRng(seed:string){ return mulberry32(hashSeed(seed)); }
export function pick<T>(rng:()=>number, values:T[]):T { return values[Math.floor(rng()*values.length)]; }
