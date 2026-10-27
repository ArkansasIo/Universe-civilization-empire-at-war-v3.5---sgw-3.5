export type GuildMember={playerId:string;rank:'leader'|'officer'|'member'|'recruit';joinedAt:number};
export type Guild={id:string;name:string;tag:string;level:number;experience:number;members:GuildMember[];bank:Record<string,number>;motd:string};
export function createGuild(name:string,tag:string,leaderId:string):Guild{return{id:crypto.randomUUID(),name,tag,level:1,experience:0,members:[{playerId:leaderId,rank:'leader',joinedAt:Date.now()}],bank:{},motd:''};}
export function addGuildXp(guild:Guild,xp:number):Guild{let experience=guild.experience+Math.max(0,xp),level=guild.level;while(level<50&&experience>=level*10000){experience-=level*10000;level++;}return{...guild,experience,level};}
export function setGuildMemberRank(guild:Guild,playerId:string,rank:GuildMember['rank']):Guild{return{...guild,members:guild.members.map(m=>m.playerId===playerId?{...m,rank}:m)}}
