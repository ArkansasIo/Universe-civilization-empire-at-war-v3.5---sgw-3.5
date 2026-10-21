import type { GeneratedUniverse } from "./types";
export function serializeUniverse(u:GeneratedUniverse,pretty=false):string{return JSON.stringify(u,null,pretty?2:0);}
export function deserializeUniverse(text:string):GeneratedUniverse{const value:unknown=JSON.parse(text);if(!value||typeof value!=="object")throw new TypeError("Universe JSON must contain an object");return value as GeneratedUniverse;}
export function cloneUniverse(u:GeneratedUniverse):GeneratedUniverse{return deserializeUniverse(serializeUniverse(u));}
export function universeDigest(u:GeneratedUniverse):string{const text=serializeUniverse(u);let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,"0");}
