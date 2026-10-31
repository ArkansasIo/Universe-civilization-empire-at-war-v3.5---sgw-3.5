import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  OGAME_DEFENSES,
  OGAME_FACILITIES,
  OGAME_SHIPS,
  OGAME_TECHNOLOGIES,
} from '../src/ogameData';
import {
  DEEP_SPACE_ANOMALIES,
  DEEP_SPACE_SECTORS,
  FLAGSHIP_MILESTONES,
  INITIAL_SORTIE_MISSIONS,
  FLAGSHIP_WEAPON_CATALOG,
  INITIAL_BRIDGE_OFFICERS,
  INITIAL_HANGAR_WINGS,
  MOTHERSHIP_CHASSIS_CLASSES,
  MOTHERSHIP_THEMES,
} from '../src/mothershipData';
import { INITIAL_MOTHERSHIP_MODULES } from '../src/gameData';

type AssetKind = 'ships' | 'defenses' | 'facilities' | 'technologies' | 'resources' | 'pages' | 'mothership';

interface AssetSpec {
  id: string;
  name: string;
  category: string;
  kind: AssetKind;
}

const parseNavigationAssets = async () => {
  const source = await readFile(path.resolve(process.cwd(), 'src/components/Sidebar.tsx'), 'utf8');
  const declaration = source.indexOf('export const OGAME_NAV_SECTIONS');
  const arrayAssignment = source.indexOf('= [', declaration);
  const arrayStart = arrayAssignment < 0 ? -1 : arrayAssignment + 2;
  if (declaration < 0 || arrayStart < 0) {
    throw new Error('Could not locate OGAME_NAV_SECTIONS in src/components/Sidebar.tsx');
  }

  let arrayDepth = 0;
  let objectDepth = 0;
  let quote = '';
  let escaped = false;
  let objectStart = -1;
  const sections: string[] = [];

  for (let index = arrayStart; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = '';
      continue;
    }

    if (character === "'" || character === '"' || character === '`') {
      quote = character;
    } else if (character === '[') {
      arrayDepth += 1;
    } else if (character === ']') {
      arrayDepth -= 1;
      if (arrayDepth === 0) break;
    } else if (character === '{') {
      objectDepth += 1;
      if (objectDepth === 1) objectStart = index;
    } else if (character === '}') {
      objectDepth -= 1;
      if (objectDepth === 0 && objectStart >= 0) {
        sections.push(source.slice(objectStart, index + 1));
        objectStart = -1;
      }
    }
  }

  return sections.flatMap((section) => {
    const id = section.match(/^\{\s*id:\s*'([^']+)'/)?.[1];
    const items = section.match(/\bitems:\s*\[([\s\S]*?)\]/)?.[1];
    if (!id || !items) return [];
    return Array.from(items.matchAll(/\{\s*id:\s*'([^']+)',\s*label:\s*'((?:\\.|[^'])*)'/g), (match) => ({
      id: match[1],
      name: match[2].replaceAll("\\'", "'").replaceAll('\\\\', '\\'),
      category: id,
      kind: 'pages' as const,
    }));
  });
};

const pageAssets = await parseNavigationAssets();

const catalogAssets: AssetSpec[] = [
  ...OGAME_SHIPS.map(({ id, name, category }) => ({ id, name, category, kind: 'ships' as const })),
  ...OGAME_DEFENSES.map(({ id, name, category }) => ({ id, name, category, kind: 'defenses' as const })),
  ...OGAME_FACILITIES.map(({ id, name, category }) => ({ id, name, category, kind: 'facilities' as const })),
  ...OGAME_TECHNOLOGIES.map(({ id, name, branch }) => ({ id, name, category: branch, kind: 'technologies' as const })),
  ...pageAssets,
  ...[
    ['metal', 'Metal', 'metal'],
    ['crystal', 'Crystal', 'crystal'],
    ['deuterium', 'Deuterium', 'deuterium'],
    ['energy', 'Energy', 'energy'],
    ['naquadah', 'Naquadah', 'naquadah'],
    ['darkMatter', 'Dark Matter', 'darkMatter'],
    ['food', 'Food', 'food'],
    ['water', 'Water', 'water'],
  ].map(([id, name, category]) => ({ id, name, category, kind: 'resources' as const })),
  { id: 'flagship', name: 'Imperial Mothership Flagship', category: 'capital', kind: 'mothership' },
  ...MOTHERSHIP_THEMES.map(({ id, name, category }) => ({ id, name, category: category.toLowerCase(), kind: 'mothership' as const })),
  ...MOTHERSHIP_CHASSIS_CLASSES.map(({ id, name, hullType }) => ({ id, name, category: hullType, kind: 'mothership' as const })),
  ...INITIAL_BRIDGE_OFFICERS.map(({ id, name, station }) => ({ id, name, category: station, kind: 'mothership' as const })),
  ...INITIAL_HANGAR_WINGS.map(({ id, name, role }) => ({ id, name, category: role, kind: 'mothership' as const })),
  ...DEEP_SPACE_SECTORS.map(({ id, name, hazardLevel }) => ({ id, name, category: hazardLevel, kind: 'mothership' as const })),
  ...DEEP_SPACE_ANOMALIES.map(({ id, title, hazard }) => ({ id, name: title, category: hazard, kind: 'mothership' as const })),
  ...FLAGSHIP_WEAPON_CATALOG.map(({ id, name, slotType }) => ({ id, name, category: slotType, kind: 'mothership' as const })),
  ...INITIAL_MOTHERSHIP_MODULES.map(({ key, name }) => ({ id: key, name, category: 'module', kind: 'mothership' as const })),
  ...INITIAL_SORTIE_MISSIONS.map(({ id, name }) => ({ id, name, category: 'mission', kind: 'mothership' as const })),
  ...FLAGSHIP_MILESTONES.map(({ id, title }) => ({ id, name: title, category: 'milestone', kind: 'mothership' as const })),
];

const palettes: Record<string, string> = {
  civilian: '#54d6df',
  combat: '#ff805b',
  carrier: '#f4c96b',
  capital: '#ff5b73',
  kinetic: '#ff9c5c',
  laser: '#6edbff',
  plasma: '#c37dff',
  missile: '#ff735e',
  shield: '#68c9ff',
  economics: '#8de08c',
  science: '#5bd7ff',
  military: '#ff806b',
  advanced_science: '#c194ff',
  advanced_fleet: '#ffa565',
  endgame: '#f16fff',
  megastructures: '#ffd36e',
  overview: '#ffd36e',
  resources: '#71d9a2',
  facilities: '#f1b66f',
  research: '#67ceff',
  shipyard: '#ff866c',
  workforce: '#c4a4ff',
  defenses: '#72c7ff',
  fleet: '#ff856a',
  galaxy: '#c28eff',
  empire: '#8de08c',
  merchant: '#f5cb6b',
  alliance: '#73d9d4',
  intelligence: '#7fa6ff',
  officers: '#f5c55e',
  admin: '#aebed0',
  profile: '#e492bc',
  store: '#f5c55e',
  imperial: '#f1c96b',
  alien: '#73df9b',
  'high-tech': '#69d7ff',
  tactical: '#ff777b',
  ancient: '#c19aff',
  cybernetic: '#70e0e0',
  dreadnought: '#ff806b',
  fortress: '#7fa6ff',
  titan: '#ffb36b',
  world_breaker: '#d181ff',
  sovereign: '#ffd36e',
  interceptor: '#6edbff',
  bomber: '#ff806b',
  torpedo: '#c37dff',
  drone: '#8de08c',
  mission: '#ff856a',
  milestone: '#ffd36e',
  resource: '#78d6a0',
  manufacturing: '#f5b96f',
  infrastructure: '#70c8ff',
  metal: '#aebed0',
  crystal: '#78d9ff',
  deuterium: '#5ce5c0',
  energy: '#ffd45c',
  naquadah: '#92e568',
  darkMatter: '#c180ff',
  food: '#92da7b',
  water: '#65bfff',
};

const invalidAssets = catalogAssets.filter((asset) => !asset.id || !asset.name || !asset.category);
if (invalidAssets.length > 0) {
  throw new Error(`Catalog assets are missing identifiers, names, or categories: ${JSON.stringify(invalidAssets)}`);
}

const hash = (value: string): number => {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
};

const randomFrom = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

const backdrop = (seed: number, color: string) => {
  const random = randomFrom(seed);
  const stars = Array.from({ length: 27 }, () => {
    const x = Math.round(random() * 248 + 4);
    const y = Math.round(random() * 105 + 4);
    const radius = (random() * 1.15 + 0.3).toFixed(2);
    const opacity = (random() * 0.55 + 0.2).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${radius}" fill="#d9efff" opacity="${opacity}"/>`;
  }).join('');

  return `<defs>
    <linearGradient id="space" x2="0" y2="1"><stop stop-color="#081522"/><stop offset="1" stop-color="#101d2a"/></linearGradient>
    <radialGradient id="haze"><stop stop-color="${color}" stop-opacity=".2"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>
    <linearGradient id="metal" x2=".15" y2="1"><stop stop-color="#dce8f1"/><stop offset=".45" stop-color="#8499a9"/><stop offset="1" stop-color="#354451"/></linearGradient>
    <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="#9ab4c7" stroke-opacity=".08" stroke-width=".6"/></pattern>
  </defs>
  <rect width="256" height="144" fill="url(#space)"/>
  <ellipse cx="176" cy="58" rx="120" ry="76" fill="url(#haze)"/>
  <rect width="256" height="144" fill="url(#grid)"/>
  ${stars}
  <path d="M0 126H256" stroke="${color}" stroke-opacity=".28"/>
  <path d="M9 10h24M9 10v12M247 10h-24M247 10v12M9 134h24M9 134v-12M247 134h-24M247 134v-12" fill="none" stroke="${color}" stroke-opacity=".55" stroke-width="1"/>`;
};

const shipArt = (asset: AssetSpec, color: string, seed: number) => {
  const scale = asset.category === 'capital' ? 1.38 : asset.category === 'carrier' ? 1.25 : asset.category === 'specialized' ? 1.12 : 1;
  const variant = seed % 3;
  const wing = variant === 0
    ? 'M-48 -8L-82 -29L-63 -4ZM-48 8L-82 29L-63 4Z'
    : variant === 1
      ? 'M-29 -11L-57 -38L-8 -15ZM-29 11L-57 38L-8 15Z'
      : 'M-51 -7L-71 -20L-18 -14ZM-51 7L-71 20L-18 14Z';
  return `<g transform="translate(128 73) scale(${scale})">
    <path d="M-91 0L-61 -5L-77 -12L-48 -9L-26 -15L25 -11L88 0L25 11L-26 15L-48 9L-77 12L-61 5Z" fill="${color}" opacity=".28" filter="url(#glow)"/>
    ${asset.category === 'civilian' ? '<path d="M-47 -14L-25 -22L30 -20L69 -9L88 0L69 9L30 20L-25 22L-47 14Z" fill="url(#metal)" stroke="#eff8ff" stroke-opacity=".6"/><path d="M-17 -19L34 -17L48 -7H-22ZM-17 19L34 17L48 7H-22Z" fill="#435a6a"/>' : ''}
    ${asset.category !== 'civilian' ? `<path d="${wing}" fill="#52697a" stroke="${color}" stroke-opacity=".72"/>
    <path d="M-54 -7L-37 -17L9 -16L68 -7L93 0L68 7L9 16L-37 17L-54 7Z" fill="url(#metal)" stroke="#e8f4fc" stroke-opacity=".62"/>
    <path d="M-24 -14L10 -12L34 -3L-30 -4ZM-24 14L10 12L34 3L-30 4Z" fill="#425969" stroke="${color}" stroke-opacity=".45"/>` : ''}
    <path d="M-12 -4L48 -2L78 0L48 2L-12 4Z" fill="#eaf7ff" opacity=".8"/>
    <path d="M-37 -6L-14 -7L-2 -3L-29 -2Z" fill="#70dfff" opacity=".8"/>
    <path d="M-38 0H-70M-35 3H-62" stroke="${color}" stroke-width="2.5" stroke-linecap="round" filter="url(#glow)"/>
    <circle cx="-43" cy="0" r="3" fill="${color}" filter="url(#glow)"/>
    <path d="M-30 -12L-23 0L-30 12" fill="none" stroke="#f3fbff" stroke-opacity=".65"/>
    <path d="M53 -4L65 0L53 4" fill="${color}" opacity=".8"/>
  </g>`;
};

const technologyArt = (asset: AssetSpec, color: string, seed: number) => {
  const count = 3 + (seed % 4);
  const nodes = Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count + (seed % 20) / 30;
    const x = 128 + Math.cos(angle) * 55;
    const y = 69 + Math.sin(angle) * 36;
    return `<path d="M128 69L${x.toFixed(1)} ${y.toFixed(1)}" stroke="${color}" stroke-opacity=".32"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#142534" stroke="${color}"/>`;
  }).join('');
  const motif = asset.category.includes('military')
    ? '<path d="M128 42L151 67L128 94L105 67Z" fill="#132433" stroke="currentColor"/><circle cx="128" cy="67" r="13" fill="none" stroke="currentColor"/><path d="M128 49V58M128 76V85M110 67H119M137 67H146" stroke="currentColor"/>'
    : asset.category.includes('economics')
      ? '<path d="M112 80L121 57L131 72L140 50L148 80Z" fill="#182a37" stroke="currentColor"/><path d="M108 84H150" stroke="currentColor"/><circle cx="124" cy="48" r="3" fill="currentColor"/>'
      : '<circle cx="128" cy="68" r="18" fill="#102332" stroke="currentColor"/><ellipse cx="128" cy="68" rx="41" ry="15" fill="none" stroke="currentColor" transform="rotate(-32 128 68)"/><ellipse cx="128" cy="68" rx="41" ry="15" fill="none" stroke="currentColor" transform="rotate(32 128 68)"/><circle cx="128" cy="68" r="5" fill="currentColor" filter="url(#glow)"/>';
  return `<g style="color:${color}">
    ${nodes}
    <circle cx="128" cy="69" r="49" fill="none" stroke="${color}" stroke-opacity=".18"/>
    <circle cx="128" cy="69" r="35" fill="#0b1824" fill-opacity=".72" stroke="${color}" stroke-opacity=".42"/>
    ${motif}
    <path d="M128 25V31M128 107V113M80 69H86M170 69H176" stroke="${color}" stroke-width="2"/>
    <path d="M24 111H74M182 111H232" stroke="${color}" stroke-opacity=".42"/>
    <text x="128" y="126" fill="#b9cddd" font-family="monospace" font-size="7" letter-spacing="2" text-anchor="middle" opacity=".72">RESEARCH SYSTEM • ${String(seed % 999).padStart(3, '0')}</text>
  </g>`;
};

const facilityArt = (asset: AssetSpec, color: string, seed: number) => {
  const random = randomFrom(seed);
  const buildings = Array.from({ length: 5 }, (_, index) => {
    const x = 33 + index * 42;
    const height = 22 + Math.round(random() * 31);
    const width = 17 + Math.round(random() * 7);
    return `<path d="M${x} 117V${117 - height}L${x + width / 2} ${111 - height}L${x + width} ${117 - height}V117Z" fill="#344b5c" stroke="${color}" stroke-opacity=".65"/>
      <path d="M${x + 5} ${111 - height}h${width - 10}M${x + 5} ${117 - height / 2}h${width - 10}" stroke="#c3d7e5" stroke-opacity=".55"/>
      <rect x="${x + width / 2 - 2}" y="${116 - height}" width="4" height="5" fill="${color}" opacity=".8"/>`;
  }).join('');
  const panels = Array.from({ length: 4 }, (_, index) => {
    const x = 47 + index * 52;
    return `<path d="M${x} 119l19 -10l19 10l-19 9Z" fill="#132c3b" stroke="${color}" stroke-opacity=".75"/><path d="M${x + 19} 109v19M${x + 8} 115h22" stroke="${color}" stroke-opacity=".32"/>`;
  }).join('');
  return `<ellipse cx="128" cy="142" rx="160" ry="47" fill="#132534"/>
    <path d="M0 126Q85 118 150 126T256 122V144H0Z" fill="#263c4b"/>
    ${asset.category === 'resource' ? panels : buildings}
    <path d="M12 130H244M26 136H230" stroke="${color}" stroke-opacity=".28"/>
    <circle cx="${38 + (seed % 180)}" cy="${79 + (seed % 17)}" r="2" fill="${color}" filter="url(#glow)"/>`;
};

const defenseArt = (asset: AssetSpec, color: string, seed: number) => {
  if (asset.category === 'shield') {
    return `<ellipse cx="128" cy="119" rx="65" ry="10" fill="${color}" opacity=".12"/>
      <path d="M66 112A62 62 0 0 1 190 112" fill="${color}" fill-opacity=".08" stroke="${color}" stroke-width="2" filter="url(#glow)"/>
      <path d="M81 111A47 47 0 0 1 175 111" fill="none" stroke="${color}" stroke-opacity=".6"/>
      <path d="M95 110A33 33 0 0 1 161 110" fill="none" stroke="#d7f4ff" stroke-opacity=".65"/>
      <path d="M46 119H210M72 125H184" stroke="${color}" stroke-opacity=".45"/>
      <circle cx="128" cy="88" r="5" fill="#dff6ff" filter="url(#glow)"/>`;
  }
  const barrel = asset.category === 'laser' || asset.category === 'plasma'
    ? '<path d="M122 73L176 51L183 55L133 82Z" fill="url(#metal)" stroke="#dce9f3" stroke-opacity=".5"/><path d="M174 53L220 34" stroke="currentColor" stroke-width="2.5" filter="url(#glow)"/>'
    : '<path d="M120 68L182 54L188 61L134 82Z" fill="url(#metal)" stroke="#dce9f3" stroke-opacity=".5"/>';
  return `<g style="color:${color}">
    <path d="M60 116H199L183 131H74Z" fill="#253b4a" stroke="${color}" stroke-opacity=".7"/>
    <path d="M82 112L94 88L132 75L159 90L169 113Z" fill="url(#metal)" stroke="#e4f0f7" stroke-opacity=".58"/>
    <circle cx="126" cy="91" r="${7 + (seed % 4)}" fill="#172a39" stroke="${color}" stroke-width="2"/>
    ${barrel}
    <path d="M99 117V128M159 116V128" stroke="#8ba1b1" stroke-width="4"/>
    <path d="M54 132H207M69 137H192" stroke="${color}" stroke-opacity=".4"/>
    <circle cx="87" cy="123" r="2" fill="${color}" filter="url(#glow)"/>
  </g>`;
};

const resourceArt = (asset: AssetSpec, color: string, seed: number) => {
  if (asset.id === 'energy') {
    return `<circle cx="128" cy="69" r="37" fill="${color}" fill-opacity=".1" stroke="${color}" stroke-width="2" filter="url(#glow)"/>
      <path d="M138 28L100 76H124L116 110L157 60H133Z" fill="${color}" stroke="#f8ffff" stroke-opacity=".7"/>
      <circle cx="128" cy="69" r="51" fill="none" stroke="${color}" stroke-opacity=".25" stroke-dasharray="3 5"/>`;
  }
  if (asset.id === 'water') {
    return `<path d="M128 25C118 43 92 70 92 89A36 36 0 0 0 164 89C164 70 138 43 128 25Z" fill="${color}" fill-opacity=".52" stroke="#dcf6ff" stroke-width="2"/>
      <path d="M111 91C112 103 119 108 129 110" stroke="#f4fcff" stroke-width="3" stroke-linecap="round" opacity=".8"/>
      <circle cx="128" cy="79" r="52" fill="none" stroke="${color}" stroke-opacity=".25"/>`;
  }
  if (asset.id === 'food') {
    return `<path d="M128 115V52M128 85C103 85 91 69 91 49C113 48 127 61 128 85ZM128 72C130 48 146 37 168 39C167 60 151 74 128 72Z" fill="${color}" fill-opacity=".65" stroke="#e6ffdb" stroke-width="2"/>
      <path d="M128 63L104 53M129 62L153 45M111 119H145" stroke="#e9f4d9" stroke-width="2" stroke-linecap="round"/>
      <circle cx="128" cy="80" r="52" fill="none" stroke="${color}" stroke-opacity=".25"/>`;
  }
  const count = 5 + (seed % 3);
  const crystals = Array.from({ length: count }, (_, index) => {
    const x = 64 + index * 24;
    const h = 20 + ((seed + index * 9) % 38);
    return `<path d="M${x} 111L${x + 9} ${111 - h}L${x + 18} 111L${x + 11} 120H${x + 5}Z" fill="${color}" fill-opacity=".68" stroke="#e9fbff" stroke-opacity=".75"/>
      <path d="M${x + 9} ${111 - h}L${x + 11} 120M${x + 9} ${111 - h}L${x + 18} 111" stroke="#f5ffff" stroke-opacity=".6"/>`;
  }).join('');
  return `<ellipse cx="128" cy="120" rx="88" ry="13" fill="${color}" opacity=".12" filter="url(#glow)"/>
    ${crystals}
    <path d="M32 123H224" stroke="${color}" stroke-opacity=".55"/>
    <circle cx="128" cy="55" r="24" fill="none" stroke="${color}" stroke-opacity=".2"/>`;
};

const pageArt = (asset: AssetSpec, color: string, seed: number) => {
  const symbols: Record<string, string> = {
    overview: '<circle cx="128" cy="68" r="25" fill="#16293a" stroke="currentColor" stroke-width="2"/><ellipse cx="128" cy="68" rx="63" ry="22" fill="none" stroke="currentColor" stroke-width="2" transform="rotate(-24 128 68)"/><circle cx="169" cy="43" r="5" fill="currentColor"/>',
    resources: '<path d="M88 103L104 49L121 102L137 35L157 103L174 65L188 104Z" fill="currentColor" fill-opacity=".48" stroke="currentColor" stroke-width="2"/><path d="M104 49L121 102M137 35L157 103M174 65L157 103" stroke="#e6f8ff"/>',
    facilities: '<path d="M75 105V65L100 77V59L128 75V49L157 69V57L183 75V105Z" fill="#40596b" stroke="currentColor" stroke-width="2"/><path d="M89 88h10v17H89zM117 88h10v17h-10zM146 88h10v17h-10zM165 48V31" stroke="currentColor" stroke-width="3"/>',
    research: '<circle cx="128" cy="68" r="18" fill="#112433" stroke="currentColor" stroke-width="2"/><ellipse cx="128" cy="68" rx="55" ry="19" fill="none" stroke="currentColor" stroke-width="2" transform="rotate(-30 128 68)"/><ellipse cx="128" cy="68" rx="55" ry="19" fill="none" stroke="currentColor" stroke-width="2" transform="rotate(30 128 68)"/><circle cx="128" cy="68" r="5" fill="currentColor"/>',
    shipyard: '<path d="M63 68L99 56L141 55L191 68L141 81L99 80Z" fill="url(#metal)" stroke="currentColor" stroke-width="2"/><path d="M95 56L80 39L123 54M95 80L80 97L123 82M73 67H46" stroke="currentColor" stroke-width="3"/><path d="M48 62L37 67L48 72" fill="currentColor"/>',
    workforce: '<circle cx="128" cy="55" r="16" fill="#23394a" stroke="currentColor" stroke-width="2"/><circle cx="88" cy="72" r="11" fill="#23394a" stroke="currentColor" stroke-width="2"/><circle cx="168" cy="72" r="11" fill="#23394a" stroke="currentColor" stroke-width="2"/><path d="M95 108C95 87 108 76 128 76C148 76 161 87 161 108M61 108C61 91 72 83 88 83C96 83 102 86 107 91M149 91C154 86 160 83 168 83C184 83 195 91 195 108" fill="none" stroke="currentColor" stroke-width="3"/>',
    defenses: '<path d="M128 29L178 48V78C178 100 155 116 128 128C101 116 78 100 78 78V48Z" fill="currentColor" fill-opacity=".14" stroke="currentColor" stroke-width="3"/><path d="M104 75L120 91L153 57" fill="none" stroke="currentColor" stroke-width="5"/>',
    fleet: '<path d="M68 79L100 68L132 69L181 80L132 91L100 91Z" fill="url(#metal)" stroke="currentColor" stroke-width="2"/><circle cx="128" cy="80" r="53" fill="none" stroke="currentColor" stroke-opacity=".48"/><circle cx="128" cy="80" r="35" fill="none" stroke="currentColor" stroke-opacity=".7"/><path d="M128 23V52M128 108V137M71 80H100M156 80H185" stroke="currentColor"/>',
    galaxy: '<circle cx="128" cy="70" r="6" fill="currentColor"/><path d="M128 70C156 38 203 48 194 74C185 100 142 101 116 83C91 66 92 42 109 40C127 37 138 53 131 68C123 83 104 89 83 83" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="192" cy="74" r="4" fill="currentColor"/>',
    empire: '<circle cx="128" cy="74" r="42" fill="#172c3c" stroke="currentColor" stroke-width="2"/><path d="M88 66Q127 46 168 66M91 87Q128 103 165 87M128 32V116" fill="none" stroke="currentColor" stroke-opacity=".72"/><ellipse cx="128" cy="74" rx="19" ry="42" fill="none" stroke="currentColor"/>',
    merchant: '<path d="M84 55H167L152 42M172 89H89L104 102" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="128" cy="72" r="27" fill="#112433" stroke="currentColor" stroke-width="2"/><path d="M128 52V92M139 60C136 55 119 55 118 64C117 70 139 70 138 79C137 90 119 89 116 83" stroke="currentColor" stroke-width="3"/>',
    alliance: '<circle cx="128" cy="70" r="14" fill="currentColor"/><circle cx="84" cy="55" r="10" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="172" cy="55" r="10" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="98" cy="100" r="10" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="158" cy="100" r="10" fill="none" stroke="currentColor" stroke-width="3"/><path d="M97 60L115 66M159 60L141 66M108 94L119 81M148 94L137 81" stroke="currentColor" stroke-width="2"/>',
    intelligence: '<path d="M69 70Q128 22 187 70Q128 118 69 70Z" fill="#112433" stroke="currentColor" stroke-width="3"/><circle cx="128" cy="70" r="19" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="2"/><circle cx="128" cy="70" r="7" fill="currentColor"/>',
    officers: '<path d="M83 96L94 51L116 73L128 35L141 73L162 51L174 96Z" fill="currentColor" fill-opacity=".5" stroke="currentColor" stroke-width="2"/><path d="M85 105H172" stroke="currentColor" stroke-width="4"/><circle cx="94" cy="49" r="4" fill="currentColor"/><circle cx="128" cy="33" r="4" fill="currentColor"/><circle cx="162" cy="49" r="4" fill="currentColor"/>',
    admin: '<rect x="76" y="40" width="104" height="66" rx="3" fill="#101d2a" stroke="currentColor" stroke-width="2"/><path d="M88 55H154M88 68H165M88 81H142M88 94H157" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="166" cy="94" r="3" fill="currentColor"/>',
    profile: '<circle cx="128" cy="57" r="20" fill="#213747" stroke="currentColor" stroke-width="2"/><path d="M81 118C82 91 100 77 128 77C156 77 174 91 175 118Z" fill="#213747" stroke="currentColor" stroke-width="2"/>',
    store: '<path d="M83 58H173L181 111H75Z" fill="#192b3a" stroke="currentColor" stroke-width="2"/><path d="M94 58C94 43 106 31 128 31C150 31 162 43 162 58" fill="none" stroke="currentColor" stroke-width="4"/><path d="M102 78H154M102 92H154" stroke="currentColor" stroke-width="2"/>',
  };
  const symbol = symbols[asset.category] ?? symbols.overview;
  const marker = String(seed % 999).padStart(3, '0');
  return `<g style="color:${color}">
    <circle cx="128" cy="71" r="59" fill="none" stroke="currentColor" stroke-opacity=".18"/>
    ${symbol}
    <path d="M23 118H67M189 118H233" stroke="currentColor" stroke-opacity=".45"/>
    <text x="128" y="130" fill="#b9cddd" font-family="monospace" font-size="7" letter-spacing="2" text-anchor="middle" opacity=".72">SYSTEM DOSSIER • ${marker}</text>
  </g>`;
};

const mothershipArt = (asset: AssetSpec, color: string, seed: number) => {
  if (asset.id.startsWith('off_')) {
    return `<circle cx="128" cy="54" r="22" fill="#263e4d" stroke="${color}" stroke-width="2"/>
      <path d="M78 120C81 92 98 77 128 77C158 77 175 92 178 120Z" fill="#263e4d" stroke="${color}" stroke-width="2"/>
      <path d="M107 53H149M115 69H141" stroke="#d7e8f4" stroke-opacity=".6"/>
      <circle cx="128" cy="72" r="48" fill="none" stroke="${color}" stroke-opacity=".28"/>`;
  }
  if (asset.id.startsWith('sec_') || asset.id.startsWith('anom_')) {
    return `<circle cx="128" cy="72" r="39" fill="#142b3a" stroke="${color}" stroke-width="2"/>
      <path d="M89 66Q127 46 167 66M92 88Q128 104 164 88M128 33V111" fill="none" stroke="${color}" stroke-opacity=".72"/>
      <ellipse cx="128" cy="72" rx="72" ry="23" fill="none" stroke="${color}" stroke-width="2" transform="rotate(-18 128 72)"/>
      <circle cx="${128 + (seed % 50) - 25}" cy="${72 + (seed % 30) - 15}" r="3" fill="#f3fbff"/>`;
  }
  if (asset.id.startsWith('wpn_')) {
    return defenseArt({ ...asset, kind: 'defenses', category: asset.category === 'point_defense' ? 'laser' : 'plasma' }, color, seed);
  }
  if (asset.category === 'module') {
    return `<path d="M90 47L128 27L166 47V94L128 116L90 94Z" fill="#172a39" stroke="${color}" stroke-width="2"/>
      <path d="M105 56L128 43L151 56V84L128 98L105 84Z" fill="none" stroke="${color}" stroke-width="2"/>
      <circle cx="128" cy="70" r="${7 + (seed % 6)}" fill="${color}" fill-opacity=".72" filter="url(#glow)"/>
      <path d="M72 70H95M161 70H184M128 17V42M128 98V123" stroke="${color}" stroke-opacity=".6"/>`;
  }
  if (asset.category === 'milestone') {
    return `<path d="M128 31L139 54L164 58L146 76L150 102L128 90L106 102L110 76L92 58L117 54Z" fill="${color}" fill-opacity=".45" stroke="${color}" stroke-width="2"/>
      <circle cx="128" cy="68" r="54" fill="none" stroke="${color}" stroke-opacity=".45"/>
      <path d="M91 110L103 131L128 119L153 131L165 110" fill="#344b5c" stroke="${color}" stroke-width="2"/>`;
  }
  if (asset.category === 'mission') {
    return `<path d="M65 72L101 61L134 62L184 74L134 86L101 85Z" fill="url(#metal)" stroke="${color}" stroke-width="2"/>
      <path d="M105 61L91 43L128 60M105 85L91 103L128 87" stroke="${color}" stroke-width="2"/>
      <circle cx="128" cy="74" r="54" fill="none" stroke="${color}" stroke-opacity=".35"/>
      <path d="M40 118H216" stroke="${color}" stroke-opacity=".5"/>`;
  }
  if (asset.id.startsWith('wing_')) {
    return shipArt({ ...asset, kind: 'ships', category: 'combat' }, color, seed);
  }
  return shipArt({ ...asset, kind: 'ships', category: 'capital' }, color, seed);
};

const flagshipArt = (color: string) => `<g transform="translate(128 76)">
  <path d="M-120 0L-84 -12L-70 -36L-40 -20L-18 -29L24 -29L55 -20L82 -28L95 -12L122 0L95 12L82 28L55 20L24 29L-18 29L-40 20L-70 36L-84 12Z" fill="url(#metal)" stroke="#eff8ff" stroke-opacity=".7" stroke-width="1.5"/>
  <path d="M-84 -12L-111 -23L-97 -8M-84 12L-111 23L-97 8M-51 -19L-68 -46L-25 -26M-51 19L-68 46L-25 26" fill="#40596b" stroke="${color}" stroke-opacity=".85" stroke-width="2"/>
  <path d="M-70 -5H68L101 0L68 5H-70Z" fill="#f3fbff" opacity=".54"/>
  <path d="M-25 -26L-8 -14L28 -14L49 -7H-46ZM-25 26L-8 14L28 14L49 7H-46Z" fill="#334a5b" stroke="${color}" stroke-opacity=".6"/>
  <path d="M-29 0A29 29 0 0 1 29 0A29 29 0 0 1 -29 0Z" fill="#081722" stroke="${color}" stroke-width="2" filter="url(#glow)"/>
  <path d="M-18 0A18 18 0 0 1 18 0A18 18 0 0 1 -18 0Z" fill="${color}" fill-opacity=".42"/>
  <path d="M-95 -3H-123M-94 3H-118" stroke="${color}" stroke-width="3" stroke-linecap="round" filter="url(#glow)"/>
  <circle cx="93" cy="0" r="4" fill="${color}" filter="url(#glow)"/>
</g>`;

const escapeXml = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

const renderSvg = (asset: AssetSpec) => {
  const seed = hash(`${asset.kind}-${asset.id}`);
  const mothershipColors = ['#76d8ff', '#ffc567', '#a58bff', '#ff7b71', '#74dfa8'];
  const color = palettes[asset.category] ?? (asset.kind === 'mothership' ? mothershipColors[seed % mothershipColors.length] : '#76d8ff');
  const art = asset.kind === 'ships'
    ? shipArt(asset, color, seed)
    : asset.kind === 'technologies'
      ? technologyArt(asset, color, seed)
      : asset.kind === 'facilities'
        ? facilityArt(asset, color, seed)
        : asset.kind === 'defenses'
          ? defenseArt(asset, color, seed)
          : asset.kind === 'resources'
            ? resourceArt(asset, color, seed)
            : asset.kind === 'pages'
              ? pageArt(asset, color, seed)
              : asset.id === 'flagship'
                ? flagshipArt(color)
                : mothershipArt(asset, color, seed);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="144" viewBox="0 0 256 144" fill="none">
  <title>${escapeXml(asset.name)}</title>
  ${backdrop(seed, color)}
  ${art}
</svg>
`;
};

const outputRoot = path.resolve(process.cwd(), 'public/images/game');
for (const asset of catalogAssets) {
  const directory = path.join(outputRoot, asset.kind);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, `${asset.id}.svg`), renderSvg(asset), 'utf8');
}

console.log(`Generated ${catalogAssets.length} original OGame-style SVG assets in ${outputRoot}`);
