import {
  NemesisRival,
  NemesisTrait,
  VendettaMission,
} from '../types';

export const NEMESIS_STRENGTHS_POOL: NemesisTrait[] = [
  {
    id: 's-plasma-shield',
    name: 'Overcharged Plasma Shield',
    type: 'strength',
    description: 'Deploys high-frequency plasma shields absorbing energy strikes.',
    effect: '-40% damage taken from standard energy salvoes.',
  },
  {
    id: 's-relentless',
    name: 'Relentless Fleet Tactics',
    type: 'strength',
    description: 'Enrages when wounded, increasing firepower under pressure.',
    effect: '+30% Attack Power when below 40% Hull.',
  },
  {
    id: 's-subspace-cloak',
    name: 'Subspace Cloaking Matrix',
    type: 'strength',
    description: 'Enshrouds flagship in dark matter fields.',
    effect: 'Immune to basic spy scans; requires advanced intel to target weaknesses.',
  },
  {
    id: 's-orbital-strike',
    name: 'Orbital Bombardment Protocol',
    type: 'strength',
    description: 'Calls down precise orbital laser bombardment.',
    effect: 'Deals 25,000 direct damage to player fleet on battle Turn 3.',
  },
  {
    id: 's-cybernetic-regen',
    name: 'Cybernetic Nano-Regen',
    type: 'strength',
    description: 'Reconstructs hull plating automatically in prolonged fights.',
    effect: 'Regenerates +8% total health every combat round.',
  },
  {
    id: 's-boarding-surge',
    name: 'Heavy Boarding Gunners',
    type: 'strength',
    description: 'Launches boarding pods directly into target command decks.',
    effect: 'Stells 15% of player Naquadah mid-battle.',
  },
];

export const NEMESIS_WEAKNESSES_POOL: NemesisTrait[] = [
  {
    id: 'w-ion-flaw',
    name: 'Ion Core Susceptibility',
    type: 'weakness',
    description: 'Unshielded ion conduits exposed near primary reactor.',
    effect: 'Takes +80% bonus damage from Ion & Beam weaponry.',
  },
  {
    id: 'w-spy-vulnerable',
    name: 'Covers Infiltration Flaw',
    type: 'weakness',
    description: 'Security protocols outdated and easily bypassed by operatives.',
    effect: '+50% espionage success rate; sabotage cost reduced.',
  },
  {
    id: 'w-flank-flaw',
    name: 'Flank Engine Blindspot',
    type: 'weakness',
    description: 'Slow turning thrusters allow flanking maneuvers.',
    effect: 'Takes double damage during Vendetta ambush missions.',
  },
  {
    id: 'w-arrogant',
    name: 'Arrogant Overconfidence',
    type: 'weakness',
    description: 'Spends initial moments taunting and boasting.',
    effect: 'Skips first attack turn in tactical duels.',
  },
  {
    id: 'w-greed',
    name: 'Naquadah Greed',
    type: 'weakness',
    description: 'Obsessed with precious metals and dark matter wealth.',
    effect: 'Can be bribed or coerced into vassalage at lower power levels.',
  },
  {
    id: 'w-paranoid',
    name: 'Paranoid Subordinate Strain',
    type: 'weakness',
    description: 'Subordinates harbour resentment and betrayal plans.',
    effect: 'High chance of internal mutiny during prolonged engagements.',
  },
];

export const INITIAL_NEMESIS_HIERARCHY: NemesisRival[] = [
  // Position 1: Overlord
  {
    id: 'nemesis-1',
    name: 'Lord Anubis Prime',
    title: 'The Ascended Dread Sovereign',
    race: 'Goa\'uld System Lord',
    rankTier: 'overlord',
    hierarchyPosition: 1,
    level: 65,
    power: 18500,
    health: 100,
    maxHealth: 100,
    avatar: '👑',
    color: '#ef4444', // red
    strengths: [NEMESIS_STRENGTHS_POOL[0], NEMESIS_STRENGTHS_POOL[3]],
    weaknesses: [NEMESIS_WEAKNESSES_POOL[0]],
    personality: 'Arrogant & Ruthless',
    taunts: {
      greeting: 'You dare approach the throne of Anubis? Your empire will crumble into dust!',
      defeatPlayer: 'Fools! Did you truly think mortal fleets could match an Ascended god?',
      retreat: 'This temporary setback means nothing! I will return with ten thousand mother ships!',
      death: 'Impossible... my ascendance... was meant to be eternal...',
    },
    history: [
      {
        id: 'mem-1',
        timestamp: 'Epoch 1.0',
        eventType: 'promoted',
        text: 'United the Goa\'uld System Lords and established supremacy over Sector 1.',
        powerImpact: 5000,
      },
      {
        id: 'mem-2',
        timestamp: 'Epoch 1.2',
        eventType: 'player_defeat',
        text: 'Crushed player advance at the Stargate Gateway and exacted 1,000,000 Naquadah tribute.',
        powerImpact: 2500,
      },
    ],
    cyberneticsScars: ['Ascended Energy Crown', 'Dark Plasma Gauntlet'],
    vassalOfPlayer: false,
    bounty: {
      active: true,
      rewardNaquadah: 5000000,
      rewardMetal: 2500000,
      rewardGlory: 1500,
      rewardDarkMatter: 500,
    },
    killsOnPlayer: 2,
    deathsToPlayer: 0,
    lastEncounterAt: '2026-09-22 12:00',
  },

  // Tier 2: Warlords (Positions 2, 3, 4)
  {
    id: 'nemesis-2',
    name: 'Archon Cipher-9',
    title: 'Matrix Overlord of Replicators',
    race: 'Replicator Collective',
    rankTier: 'warlord',
    hierarchyPosition: 2,
    level: 52,
    power: 14200,
    health: 100,
    maxHealth: 100,
    avatar: '🤖',
    color: '#f59e0b', // amber
    strengths: [NEMESIS_STRENGTHS_POOL[4], NEMESIS_STRENGTHS_POOL[1]],
    weaknesses: [NEMESIS_WEAKNESSES_POOL[0]],
    personality: 'Calculating & Cold',
    taunts: {
      greeting: 'Assimilating local sector data. Human resistance is mathematically futile.',
      defeatPlayer: 'Target fleet disassembled. Raw metal harvested into replicator blocks.',
      retreat: 'Re-evaluating parameters. Disengaging to re-replicate nanite armor.',
      death: 'Core matrix fractured... collective memory fading...',
    },
    history: [
      {
        id: 'mem-3',
        timestamp: 'Epoch 1.1',
        eventType: 'promoted',
        text: 'Consumed 3 rogue asteroid mines and seized Warlord rank in the hierarchy.',
        powerImpact: 3000,
      },
    ],
    cyberneticsScars: ['Nanite Reconstituted Core', 'Neutronium Plating'],
    vassalOfPlayer: false,
    bounty: {
      active: true,
      rewardNaquadah: 3000000,
      rewardMetal: 2000000,
      rewardGlory: 1000,
      rewardDarkMatter: 300,
    },
    killsOnPlayer: 1,
    deathsToPlayer: 0,
    lastEncounterAt: '2026-09-22 10:30',
  },
  {
    id: 'nemesis-3',
    name: 'Prior Inquisitor Vael',
    title: 'Hand of the Ori',
    race: 'Ori Crusade',
    rankTier: 'warlord',
    hierarchyPosition: 3,
    level: 48,
    power: 12800,
    health: 100,
    maxHealth: 100,
    avatar: '☸️',
    color: '#8b5cf6', // purple
    strengths: [NEMESIS_STRENGTHS_POOL[0], NEMESIS_STRENGTHS_POOL[2]],
    weaknesses: [NEMESIS_WEAKNESSES_POOL[3]],
    personality: 'Fanatical & Holy',
    taunts: {
      greeting: 'Hallowed are the Ori! Bow before the Book of Origin or face holy fire!',
      defeatPlayer: 'Your heresy has been cleansed in holy flame.',
      retreat: 'The Ori test my resolve. I shall pray for greater judgment upon your world.',
      death: 'My soul ascends to the Origin...',
    },
    history: [
      {
        id: 'mem-4',
        timestamp: 'Epoch 0.9',
        eventType: 'promoted',
        text: 'Converted 5 planetary colonies and established the Inquisitor Crusade Fleet.',
        powerImpact: 2200,
      },
    ],
    cyberneticsScars: ['Holy Origin Staff', 'Psionic Energy Field'],
    vassalOfPlayer: false,
    bounty: {
      active: true,
      rewardNaquadah: 2500000,
      rewardMetal: 1500000,
      rewardGlory: 800,
      rewardDarkMatter: 250,
    },
    killsOnPlayer: 0,
    deathsToPlayer: 1,
    lastEncounterAt: '2026-09-21 18:45',
  },
  {
    id: 'nemesis-4',
    name: 'Captain Vondrak',
    title: 'The Bloodfang Corsair',
    race: 'Mercenary Void Syndicate',
    rankTier: 'warlord',
    hierarchyPosition: 4,
    level: 45,
    power: 11500,
    health: 100,
    maxHealth: 100,
    avatar: '☠️',
    color: '#3b82f6', // blue
    strengths: [NEMESIS_STRENGTHS_POOL[5], NEMESIS_STRENGTHS_POOL[1]],
    weaknesses: [NEMESIS_WEAKNESSES_POOL[4]],
    personality: 'Mercenary & Opportunistic',
    taunts: {
      greeting: 'Nothing personal, Commander! Anubis pays top Naquadah for your head!',
      defeatPlayer: 'Haha! Easy profit! Your cargo is ours!',
      retreat: 'Contract canceled! Not getting paid enough to die here!',
      death: 'Curse you... my plunder...',
    },
    history: [
      {
        id: 'mem-5',
        timestamp: 'Epoch 1.3',
        eventType: 'ambush',
        text: 'Ambushed player supply lines and looted 400,000 Naquadah.',
        powerImpact: 1800,
      },
    ],
    cyberneticsScars: ['Cybernetic Eye Sensor', 'Bionic Mechanical Arm'],
    vassalOfPlayer: false,
    bounty: {
      active: true,
      rewardNaquadah: 2000000,
      rewardMetal: 1000000,
      rewardGlory: 700,
      rewardDarkMatter: 200,
    },
    killsOnPlayer: 1,
    deathsToPlayer: 1,
    lastEncounterAt: '2026-09-22 08:15',
  },

  // Tier 3: Captains (Positions 5-9)
  {
    id: 'nemesis-5',
    name: 'Overseer Rhaz',
    title: 'The Naquadah Eater',
    race: 'Goa\'uld System Lord',
    rankTier: 'captain',
    hierarchyPosition: 5,
    level: 38,
    power: 8900,
    health: 100,
    maxHealth: 100,
    avatar: '🗡️',
    color: '#10b981', // green
    strengths: [NEMESIS_STRENGTHS_POOL[5]],
    weaknesses: [NEMESIS_WEAKNESSES_POOL[1]],
    personality: 'Gluttonous & Cruel',
    taunts: {
      greeting: 'I smell raw Naquadah in your ship holds! Hand it over or suffer!',
      defeatPlayer: 'Your mines belong to Overseer Rhaz now!',
      retreat: 'Retreat to the orbital base! We shall regroup!',
      death: 'My Naquadah... mines...',
    },
    history: [],
    cyberneticsScars: [],
    vassalOfPlayer: false,
    bounty: {
      active: false,
      rewardNaquadah: 1000000,
      rewardMetal: 500000,
      rewardGlory: 400,
      rewardDarkMatter: 100,
    },
    killsOnPlayer: 0,
    deathsToPlayer: 0,
    lastEncounterAt: 'Never',
  },
  {
    id: 'nemesis-6',
    name: 'Renegade Loki',
    title: 'The Outcast Scientist',
    race: 'Rogue Asgard Faction',
    rankTier: 'captain',
    hierarchyPosition: 6,
    level: 36,
    power: 8200,
    health: 100,
    maxHealth: 100,
    avatar: '👽',
    color: '#06b6d4', // cyan
    strengths: [NEMESIS_STRENGTHS_POOL[2]],
    weaknesses: [NEMESIS_WEAKNESSES_POOL[2]],
    personality: 'Paranoid & Brilliant',
    taunts: {
      greeting: 'Your genetic samples will prove vital to my forbidden clone experiments!',
      defeatPlayer: 'Subject neutralized. Commencing genetic harvesting.',
      retreat: 'Teleportation activated! You will not impede science!',
      death: 'My research... destroyed...',
    },
    history: [],
    cyberneticsScars: ['Subspace Beaming Ring'],
    vassalOfPlayer: false,
    bounty: {
      active: true,
      rewardNaquadah: 1200000,
      rewardMetal: 600000,
      rewardGlory: 500,
      rewardDarkMatter: 150,
    },
    killsOnPlayer: 0,
    deathsToPlayer: 0,
    lastEncounterAt: 'Never',
  },
  {
    id: 'nemesis-7',
    name: 'Legate Darian',
    title: 'The Iron Tribune',
    race: 'Tauri Renegade Fleet',
    rankTier: 'captain',
    hierarchyPosition: 7,
    level: 32,
    power: 7400,
    health: 100,
    maxHealth: 100,
    avatar: '⚓',
    color: '#6366f1', // indigo
    strengths: [NEMESIS_STRENGTHS_POOL[1]],
    weaknesses: [NEMESIS_WEAKNESSES_POOL[5]],
    personality: 'Stubborn & Militant',
    taunts: {
      greeting: 'Former SGC Officer Darian standing against you. Clear the sector!',
      defeatPlayer: 'Tactical blunder on your part, Commander.',
      retreat: 'Fall back in formation! Maintain rear shield integrity!',
      death: 'Honor... to the fallen...',
    },
    history: [],
    cyberneticsScars: [],
    vassalOfPlayer: false,
    bounty: {
      active: false,
      rewardNaquadah: 800000,
      rewardMetal: 400000,
      rewardGlory: 300,
      rewardDarkMatter: 80,
    },
    killsOnPlayer: 0,
    deathsToPlayer: 0,
    lastEncounterAt: 'Never',
  },
  {
    id: 'nemesis-8',
    name: 'Marauder Jax',
    title: 'Star Scourge of Sector 7',
    race: 'Mercenary Void Syndicate',
    rankTier: 'captain',
    hierarchyPosition: 8,
    level: 30,
    power: 6800,
    health: 100,
    maxHealth: 100,
    avatar: '🗡️',
    color: '#ec4899', // pink
    strengths: [NEMESIS_STRENGTHS_POOL[3]],
    weaknesses: [NEMESIS_WEAKNESSES_POOL[3]],
    personality: 'Reckless & Loud',
    taunts: {
      greeting: 'More target practice! Fire all railguns!',
      defeatPlayer: 'Hahaha! Too easy!',
      retreat: 'Punch the hyperdrive! We are out of here!',
      death: 'Boom... total engine blowout...',
    },
    history: [],
    cyberneticsScars: [],
    vassalOfPlayer: false,
    bounty: {
      active: false,
      rewardNaquadah: 700000,
      rewardMetal: 350000,
      rewardGlory: 250,
      rewardDarkMatter: 70,
    },
    killsOnPlayer: 0,
    deathsToPlayer: 0,
    lastEncounterAt: 'Never',
  },

  // Tier 4: Enforcers & Recruits (Positions 9-12)
  {
    id: 'nemesis-9',
    name: 'Commander Vex',
    title: 'The Ashen Initiate',
    race: 'Goa\'uld System Lord',
    rankTier: 'enforcer',
    hierarchyPosition: 9,
    level: 22,
    power: 4500,
    health: 100,
    maxHealth: 100,
    avatar: '🔰',
    color: '#84cc16', // lime
    strengths: [NEMESIS_STRENGTHS_POOL[0]],
    weaknesses: [NEMESIS_WEAKNESSES_POOL[0]],
    personality: 'Ambitious & Eager',
    taunts: {
      greeting: 'Lord Anubis will reward me richly when I present your wreckage!',
      defeatPlayer: 'My promotion is guaranteed now!',
      retreat: 'I will report this to Lord Anubis!',
      death: 'Master... forgive me...',
    },
    history: [],
    cyberneticsScars: [],
    vassalOfPlayer: false,
    bounty: {
      active: false,
      rewardNaquadah: 500000,
      rewardMetal: 250000,
      rewardGlory: 200,
      rewardDarkMatter: 50,
    },
    killsOnPlayer: 0,
    deathsToPlayer: 0,
    lastEncounterAt: 'Never',
  },
  {
    id: 'nemesis-10',
    name: 'Unit Vector-X',
    title: 'Rogue Assembler Unit',
    race: 'Replicator Collective',
    rankTier: 'enforcer',
    hierarchyPosition: 10,
    level: 20,
    power: 4100,
    health: 100,
    maxHealth: 100,
    avatar: '🤖',
    color: '#64748b', // slate
    strengths: [NEMESIS_STRENGTHS_POOL[4]],
    weaknesses: [NEMESIS_WEAKNESSES_POOL[1]],
    personality: 'Programmed Directive',
    taunts: {
      greeting: 'Consuming local mineral alloys. Target acquired.',
      defeatPlayer: 'Conversion complete.',
      retreat: 'Sub-routine failover active.',
      death: 'Termination sequence executed.',
    },
    history: [],
    cyberneticsScars: [],
    vassalOfPlayer: false,
    bounty: {
      active: false,
      rewardNaquadah: 400000,
      rewardMetal: 200000,
      rewardGlory: 150,
      rewardDarkMatter: 40,
    },
    killsOnPlayer: 0,
    deathsToPlayer: 0,
    lastEncounterAt: 'Never',
  },
  {
    id: 'nemesis-11',
    name: 'Korg the Crusher',
    title: 'Void Mercenary Recruiter',
    race: 'Mercenary Void Syndicate',
    rankTier: 'enforcer',
    hierarchyPosition: 11,
    level: 18,
    power: 3600,
    health: 100,
    maxHealth: 100,
    avatar: '🪓',
    color: '#14b8a6', // teal
    strengths: [NEMESIS_STRENGTHS_POOL[1]],
    weaknesses: [NEMESIS_WEAKNESSES_POOL[4]],
    personality: 'Brutish',
    taunts: {
      greeting: 'Korg smash your command bridge!',
      defeatPlayer: 'Korg wins! Big Naquadah!',
      retreat: 'Korg run away now!',
      death: 'Aargh... Korg broken...',
    },
    history: [],
    cyberneticsScars: [],
    vassalOfPlayer: false,
    bounty: {
      active: false,
      rewardNaquadah: 350000,
      rewardMetal: 150000,
      rewardGlory: 100,
      rewardDarkMatter: 30,
    },
    killsOnPlayer: 0,
    deathsToPlayer: 0,
    lastEncounterAt: 'Never',
  },
];

export const INITIAL_VENDETTA_MISSIONS: VendettaMission[] = [
  {
    id: 'vendetta-1',
    nemesisId: 'nemesis-1',
    title: 'Assassinate Lord Anubis Prime',
    description: 'Destroy Anubis\'s flagship in high orbit to shatter his supremacy over Sector 1.',
    type: 'assassinate',
    reward: {
      naquadah: 5000000,
      metal: 2500000,
      glory: 1500,
      darkMatter: 500,
    },
    status: 'active',
    turnsRemaining: 12,
  },
  {
    id: 'vendetta-2',
    nemesisId: 'nemesis-4',
    title: 'Avenge Supply Convoy (Captain Vondrak)',
    description: 'Track down Corsair Vondrak and reclaim the looted Naquadah from his pirate station.',
    type: 'ambush_counter',
    reward: {
      naquadah: 2000000,
      metal: 1000000,
      glory: 700,
      darkMatter: 200,
    },
    status: 'active',
    turnsRemaining: 8,
  },
];

// Procedural Nemesis Rival Generator helper
export function generateRandomNemesis(
  position: number,
  rankTier: 'overlord' | 'warlord' | 'captain' | 'enforcer'
): NemesisRival {
  const names = [
    'System Lord Moloc',
    'Prior Orik',
    'Centurion Xor-7',
    'Captain Ironhide',
    'Dread Marauder Zark',
    'Archon Vaelis',
    'Overseer Hathor',
    'Inquisitor Dagon',
    'Sub-Commander Tarek',
  ];
  const titles = [
    'The Blood Scourge',
    'Naquadah Devourer',
    'Star Destroyer',
    'Cybernetic Abomination',
    'The Undying',
    'Flame of the Ori',
    'Void Stalker',
  ];
  const races = [
    'Goa\'uld System Lord',
    'Replicator Collective',
    'Ori Crusade',
    'Rogue Asgard Faction',
    'Mercenary Void Syndicate',
  ];
  const avatars = ['👑', '🤖', '☸️', '☠️', '🗡️', '👽', '⚓', '🔰', '🪓'];
  const colors = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#06b6d4', '#ec4899'];

  const randName = names[Math.floor(Math.random() * names.length)] + ' ' + Math.floor(Math.random() * 99 + 1);
  const randTitle = titles[Math.floor(Math.random() * titles.length)];
  const randRace = races[Math.floor(Math.random() * races.length)];
  const randAvatar = avatars[Math.floor(Math.random() * avatars.length)];
  const randColor = colors[Math.floor(Math.random() * colors.length)];

  let baseLevel = 15;
  let basePower = 3000;
  if (rankTier === 'overlord') {
    baseLevel = 60 + Math.floor(Math.random() * 10);
    basePower = 18000 + Math.floor(Math.random() * 5000);
  } else if (rankTier === 'warlord') {
    baseLevel = 42 + Math.floor(Math.random() * 12);
    basePower = 11000 + Math.floor(Math.random() * 4000);
  } else if (rankTier === 'captain') {
    baseLevel = 28 + Math.floor(Math.random() * 10);
    basePower = 6500 + Math.floor(Math.random() * 3000);
  } else {
    baseLevel = 15 + Math.floor(Math.random() * 10);
    basePower = 3000 + Math.floor(Math.random() * 2000);
  }

  const strength = NEMESIS_STRENGTHS_POOL[Math.floor(Math.random() * NEMESIS_STRENGTHS_POOL.length)];
  const weakness = NEMESIS_WEAKNESSES_POOL[Math.floor(Math.random() * NEMESIS_WEAKNESSES_POOL.length)];

  return {
    id: `nemesis-gen-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: randName,
    title: randTitle,
    race: randRace,
    rankTier,
    hierarchyPosition: position,
    level: baseLevel,
    power: basePower,
    health: 100,
    maxHealth: 100,
    avatar: randAvatar,
    color: randColor,
    strengths: [strength],
    weaknesses: [weakness],
    personality: 'Hostile & Opportunistic',
    taunts: {
      greeting: `You cross the paths of ${randName}! Prepare for annihilation!`,
      defeatPlayer: 'Another foolish commander crushed under my heels!',
      retreat: 'Tactical warp jump engaged! I will crush you next time!',
      death: 'No... my legacy cannot end like this...',
    },
    history: [
      {
        id: `mem-${Date.now()}`,
        timestamp: 'Just Now',
        eventType: 'promoted',
        text: `Emerges as the new ${rankTier.toUpperCase()} in the galactic sector!`,
        powerImpact: 1000,
      },
    ],
    cyberneticsScars: [],
    vassalOfPlayer: false,
    bounty: {
      active: true,
      rewardNaquadah: basePower * 250,
      rewardMetal: basePower * 120,
      rewardGlory: Math.floor(baseLevel * 15),
      rewardDarkMatter: Math.floor(baseLevel * 5),
    },
    killsOnPlayer: 0,
    deathsToPlayer: 0,
    lastEncounterAt: 'Never',
  };
}
