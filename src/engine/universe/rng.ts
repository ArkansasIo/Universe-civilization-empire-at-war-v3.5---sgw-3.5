export function hashSeed(seed:number|string):number { const text=String(seed); let h=2166136261; for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);} return h>>>0; }
export function mulberry32(seed:number):()=>number { let state=seed>>>0; return ()=>{state=(state+0x6d2b79f5)>>>0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}; }
export function randomInt(r:()=>number,min:number,max:number):number { return min+Math.floor(r()*(max-min+1)); }
export function randomFloat(r:()=>number,min:number,max:number):number { return min+r()*(max-min); }
export function chance(r:()=>number,p:number):boolean { return r()<p; }
export function pick<T>(r:()=>number,values:readonly T[]):T { if(values.length===0) throw new Error("Cannot pick from an empty collection"); return values[Math.floor(r()*values.length)]!; }
export function shuffle<T>(r:()=>number,values:readonly T[]):T[] { const a=[...values]; for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];} return a; }
export function forkRandom(parent:()=>number):()=>number { return mulberry32(Math.floor(parent()*0x100000000)>>>0); }
export function hashCombine(...parts:(string|number)[]):number { return hashSeed(parts.join("|")); }
