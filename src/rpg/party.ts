export type PartyMember={playerId:string;role:'tank'|'healer'|'dps'|'support';joinedAt:number;online:boolean};
export type Party={id:string;leaderId:string;members:PartyMember[];maxSize:number};
export function createParty(leaderId:string,maxSize=5):Party{return{id:crypto.randomUUID(),leaderId,members:[{playerId:leaderId,role:'dps',joinedAt:Date.now(),online:true}],maxSize};}
export function addMember(party:Party,member:PartyMember):Party{if(party.members.some(m=>m.playerId===member.playerId))return party;if(party.members.length>=party.maxSize)throw new Error('Party is full');return{...party,members:[...party.members,member]};}
export function removeMember(party:Party,playerId:string):Party{const members=party.members.filter(m=>m.playerId!==playerId);if(!members.length)throw new Error('Cannot remove final party member');const leaderId=party.leaderId===playerId?members[0].playerId:party.leaderId;return{...party,leaderId,members};}
export function hasRole(party:Party,role:PartyMember['role']):boolean{return party.members.some(m=>m.role===role);}
export function partyComposition(party:Party):{tanks:number;healers:number;dps:number;support:number}{return party.members.reduce((a,m)=>{a[m.role==='tank'?'tanks':m.role==='healer'?'healers':m.role==='support'?'support':'dps']++;return a;},{tanks:0,healers:0,dps:0,support:0});}
