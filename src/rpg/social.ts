export interface PartyState { id: string; leaderId: string; memberIds: string[]; maxMembers: number; }
export interface GuildState { id: string; name: string; leaderId: string; memberIds: string[]; level: number; experience: number; }

export function createParty(id: string, leaderId: string, maxMembers = 5): PartyState {
  return { id, leaderId, memberIds: [leaderId], maxMembers };
}

export function addPartyMember(party: PartyState, playerId: string): PartyState {
  if (party.memberIds.includes(playerId)) return party;
  if (party.memberIds.length >= party.maxMembers) throw new Error("party is full");
  return { ...party, memberIds: [...party.memberIds, playerId] };
}

export function removePartyMember(party: PartyState, playerId: string): PartyState {
  if (!party.memberIds.includes(playerId)) return party;
  const memberIds = party.memberIds.filter(id => id !== playerId);
  if (!memberIds.length) return party;
  return { ...party, memberIds, leaderId: party.leaderId === playerId ? memberIds[0]! : party.leaderId };
}

export function createGuild(id: string, name: string, leaderId: string): GuildState {
  return { id, name, leaderId, memberIds: [leaderId], level: 1, experience: 0 };
}

export function addGuildMember(guild: GuildState, playerId: string): GuildState {
  return guild.memberIds.includes(playerId) ? guild : { ...guild, memberIds: [...guild.memberIds, playerId] };
}

export function addGuildExperience(guild: GuildState, amount: number): GuildState {
  if (amount < 0) throw new Error("amount must be non-negative");
  let level = guild.level;
  let experience = guild.experience + Math.floor(amount);
  while (experience >= level * 1000) { experience -= level * 1000; level += 1; }
  return { ...guild, level, experience };
}
