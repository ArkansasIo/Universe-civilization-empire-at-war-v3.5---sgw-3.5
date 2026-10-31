/**
 * The commander story campaign: "The Long Dawn".
 *
 * One beat per unlock milestone in `levelLocks.ts`. Reaching a beat's level
 * reveals it (story modal + Missions log) and opens the routes listed in
 * `getRoutesUnlockedAtLevel(beat.level)`.
 */
import { getRoutesUnlockedAtLevel, type RouteLevelLock } from './levelLocks';

export interface StoryChapter {
  id: string;
  number: number;
  title: string;
  synopsis: string;
}

export interface StoryBeat {
  id: string;
  chapterId: string;
  level: number;
  title: string;
  speaker: string;
  text: readonly string[];
  /** Short directive that points the player at the newly opened screens. */
  directive: string;
}

export const STORY_CHAPTERS: readonly StoryChapter[] = [
  {
    id: 'ch1',
    number: 1,
    title: 'Embers of the Reach',
    synopsis: 'A colony ship lands broken on a cold world at the edge of charted space. Survival comes first.',
  },
  {
    id: 'ch2',
    number: 2,
    title: 'The Iron Covenant',
    synopsis: 'The colony becomes a state. Laws, forges and the first warships follow.',
  },
  {
    id: 'ch3',
    number: 3,
    title: 'Shadows Between Stars',
    synopsis: 'Someone has been watching the Reach. The colony learns to watch back.',
  },
  {
    id: 'ch4',
    number: 4,
    title: 'The Open Gate',
    synopsis: 'A ring of dead alloy beneath the ice wakes, and the neighbours arrive.',
  },
  {
    id: 'ch5',
    number: 5,
    title: 'Leviathans',
    synopsis: 'The Pale Concord comes in force. Only capital ships and old relics can answer it.',
  },
  {
    id: 'ch6',
    number: 6,
    title: 'Beyond the Last Horizon',
    synopsis: 'The war ends at the edge of the map, and the map turns out to be far larger.',
  },
];

export const STORY_BEATS: readonly StoryBeat[] = [
  {
    id: 'beat-01',
    chapterId: 'ch1',
    level: 1,
    title: 'Landfall',
    speaker: 'Chief Engineer Ilsa Varro',
    text: [
      'The colony ship Long Dawn came down hard in the Tharsel basin. Hull breached, drives gone, eleven thousand sleepers still in their pods.',
      '"Commander, the reactor holds, but the stores will not last the winter. Get the mines running and keep an honest count of every crate. We start from nothing."',
    ],
    directive: 'Open the Resource Vault and Income screens, then send a directive from Missions.',
  },
  {
    id: 'beat-02',
    chapterId: 'ch1',
    level: 2,
    title: 'Scaffolds in the Snow',
    speaker: 'Chief Engineer Ilsa Varro',
    text: [
      'The first ore smelts clean. Varro strips the ship\'s cargo cranes and bolts them to the ice: a construction yard, crude but working.',
      '"Power is the bottleneck now. Wire the grid, raise silos before the next storm and start sketching a research plan. The pods won\'t wake themselves."',
    ],
    directive: 'Construction Yard, Power Grid, Storage Silos, Factories and the Tech Tree are now open.',
  },
  {
    id: 'beat-03',
    chapterId: 'ch1',
    level: 3,
    title: 'The Waking',
    speaker: 'Archivist Senne Ohl',
    text: [
      'The first thousand sleepers stagger out into the cold. Mouths to feed, hands to train. Archivist Ohl opens the ship\'s library and begins teaching.',
      'In the orbital wreckage, Varro finds a drydock frame still intact. "Patch it up and we can build ships again. Small ones, for now."',
    ],
    directive: 'Research Labs, Population, Life Support, the Workforce Academy and the Shipyard are open.',
  },
  {
    id: 'beat-04',
    chapterId: 'ch2',
    level: 4,
    title: 'The Charter',
    speaker: 'Quartermaster Dov Kessane',
    text: [
      'With ten thousand awake, the arguments start. Kessane calls an assembly in the cargo hold and writes the first charter on a loading manifest.',
      '"A colony runs on trust and ledgers, Commander. Pick a form of government, open a market, and let people earn their place."',
    ],
    directive: 'Government Systems, Automated Industry, Enlistment, the Roster, the Exchange and the Bank are open.',
  },
  {
    id: 'beat-05',
    chapterId: 'ch2',
    level: 5,
    title: 'Forge and Bulwark',
    speaker: 'Chief Engineer Ilsa Varro',
    text: [
      'Long-range sensors catch a hull signature drifting through the outer belt. No transponder. It watches for six hours, then vanishes.',
      '"We\'re not alone out here. Put guns on the ridge, shields over the domes, and fire up the forge. I want production lines running by the next shift."',
    ],
    directive: 'Ship Production, Miners, the Defense Grid, Shields, Batteries, Fortifications and the Forge are open.',
  },
  {
    id: 'beat-06',
    chapterId: 'ch2',
    level: 6,
    title: 'First Flight',
    speaker: 'Wing Leader Aster Quell',
    text: [
      'Six corvettes clear the drydock and form up over the basin. Quell takes the lead and flies them past the moon and back.',
      '"The neighbouring systems are rich and empty. Give us targets and we\'ll find worlds worth settling. A second colony makes us harder to kill."',
    ],
    directive: 'Fleet Units, Dispatch, Combat Reports, Military Scores, Weapons and Armor Tech, and Colonies are open.',
  },
  {
    id: 'beat-07',
    chapterId: 'ch3',
    level: 7,
    title: 'The Listening Post',
    speaker: 'Signals Officer Teo Marrin',
    text: [
      'Marrin finds it buried in the ice two kilometres north: a listening post, not ours, still transmitting. Its log holds every shipment we have made since landfall.',
      '"Someone has been reading our mail, Commander. Time we started reading theirs."',
    ],
    directive: 'Espionage, Covert and Counter-Sensor Tech, Procurement, Hazards and Academy Wings are open.',
  },
  {
    id: 'beat-08',
    chapterId: 'ch3',
    level: 8,
    title: 'Moonrise',
    speaker: 'Wing Leader Aster Quell',
    text: [
      'The listening post\'s signal points at a small grey moon three systems out. Quell\'s expedition finds a sensor array there, abandoned in a hurry.',
      '"Whoever built it ran from something. Let\'s fit the fleet properly, claim the moon and see what else is out in the dark."',
    ],
    directive: 'Ship Fitting, the Unit Roster, Moon Bases, Expeditions, Colonial Power and Defenses are open.',
  },
  {
    id: 'beat-09',
    chapterId: 'ch3',
    level: 10,
    title: 'The Pale Concord',
    speaker: 'Archivist Senne Ohl',
    text: [
      'Ohl decodes the moon array\'s records. The watchers call themselves the Pale Concord: a fleet with no homeworld that strips colonies and moves on.',
      '"They weren\'t watching us out of curiosity. They were waiting to see if we\'d be worth taking. We need blueprints, officers, and friends who can be bought."',
    ],
    directive: 'Master Facilities, Blueprints, the Tech Archive, Sabotage, Intel, Mercenaries and Commander HQ are open.',
  },
  {
    id: 'beat-10',
    chapterId: 'ch4',
    level: 12,
    title: 'The Ring Beneath the Ice',
    speaker: 'Chief Engineer Ilsa Varro',
    text: [
      'Deep under the Tharsel basin, the drills strike something that is not rock: a ring of dark alloy, sixty metres across, older than the planet\'s crust.',
      'When Varro routes power into it, it opens. On the far side, a world with three suns, and a delegation already waiting. They were expecting us.',
    ],
    directive: 'Transit Gates, Gate Tokens, Reconnaissance, Diplomacy and Alliance HQ are open.',
  },
  {
    id: 'beat-11',
    chapterId: 'ch4',
    level: 14,
    title: 'A Table of Many Chairs',
    speaker: 'Envoy Rhenna Sol of the Veyl Compact',
    text: [
      '"Your Commander is young, but you hold a working gate. That makes you worth listening to."',
      'The Veyl Compact offers starbase plans and a seat among the free peoples. The price: when the Concord comes, the Reach stands with them.',
    ],
    directive: 'Guilds & Raids, Orbital Starbases, Alien Races and the Seasonal Commander Roster are open.',
  },
  {
    id: 'beat-12',
    chapterId: 'ch5',
    level: 16,
    title: 'Keels of Giants',
    speaker: 'Chief Engineer Ilsa Varro',
    text: [
      'The Concord takes a Compact world in a single night. Corvettes will not stop them.',
      'Through the gate come the relics of a people who fought the Concord once before and lost. Varro lays down the keel of the first mothership. "We build big, Commander, or we don\'t build at all."',
    ],
    directive: 'Relics, Hyperspace, the Mothership, Titans and Planetary Invasion are open.',
  },
  {
    id: 'beat-13',
    chapterId: 'ch5',
    level: 18,
    title: 'The Hollow Admiral',
    speaker: 'Signals Officer Teo Marrin',
    text: [
      'An intercepted order gives the Concord fleet a name at last: Admiral Corvane Hesk, who turned on their own people for a place in the Concord.',
      '"Hesk has lieutenants holding a dozen systems. Break them one by one and the admiral will have to come out personally."',
    ],
    directive: 'Warlord Raids, the Nemesis System and Arc Bosses are open.',
  },
  {
    id: 'beat-14',
    chapterId: 'ch5',
    level: 20,
    title: 'The Lantern',
    speaker: 'Archivist Senne Ohl',
    text: [
      'Hesk falls at the Battle of Corrin Drift. Among the wreckage, Ohl finds the Concord\'s secret: they were never conquerors. They were fleeing.',
      'The relic schematics show what drove them: something beyond the galactic rim. To see it coming, the Reach must build a lantern the size of a star.',
    ],
    directive: 'Stellar Megastructures are open.',
  },
  {
    id: 'beat-15',
    chapterId: 'ch6',
    level: 22,
    title: 'Uncharted',
    speaker: 'Wing Leader Aster Quell',
    text: [
      'The Lantern burns, and its light reaches farther than any map. Quell takes a long-range wing past the rim into regions no chart has ever named.',
      '"Every system out here is new, Commander. It\'s beautiful. And it\'s emptier than it should be."',
    ],
    directive: 'The Procedural Universe Explorer is open.',
  },
  {
    id: 'beat-16',
    chapterId: 'ch6',
    level: 24,
    title: 'Many Skies',
    speaker: 'Chief Engineer Ilsa Varro',
    text: [
      'At full power the ring under Tharsel dials somewhere it was never meant to reach: the same basin, the same colony, under a different sky.',
      'Thirty versions of the Reach, each one a little different. Some never woke. Some never stopped fighting. All of them can now be reached.',
    ],
    directive: 'The multiverse map of 30 Universes & 90 Galaxies is open.',
  },
  {
    id: 'beat-17',
    chapterId: 'ch6',
    level: 30,
    title: 'The Long Dawn',
    speaker: 'Archivist Senne Ohl',
    text: [
      'The thing beyond the rim was never a fleet. It was the end of a cycle, the same one the gate builders faced. They chose to step aside from it.',
      '"The chamber is ready, Commander. What the Reach becomes next is your choice. You brought eleven thousand sleepers through the winter. Now see where they go."',
    ],
    directive: 'The Ascension Chamber is open.',
  },
];

export function getStoryChapter(chapterId: string): StoryChapter | undefined {
  return STORY_CHAPTERS.find((chapter) => chapter.id === chapterId);
}

export function getStoryBeatsForChapter(chapterId: string): StoryBeat[] {
  return STORY_BEATS.filter((beat) => beat.chapterId === chapterId);
}

/** Beats unlocked at or below the commander level. */
export function getRevealedStoryBeats(commanderLevel: number): StoryBeat[] {
  return STORY_BEATS.filter((beat) => beat.level <= commanderLevel);
}

/** Beats revealed by moving from one level to a higher one (exclusive of the old level). */
export function getStoryBeatsBetween(fromLevel: number, toLevel: number): StoryBeat[] {
  return STORY_BEATS.filter((beat) => beat.level > fromLevel && beat.level <= toLevel);
}

export function getNextStoryBeat(commanderLevel: number): StoryBeat | undefined {
  return STORY_BEATS.find((beat) => beat.level > commanderLevel);
}

export function getStoryBeatUnlocks(beat: StoryBeat): RouteLevelLock[] {
  return getRoutesUnlockedAtLevel(beat.level);
}
