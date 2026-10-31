# Commander level locks and story campaign

## Audit (2026-10-31)

- **Routes:** `src/App.tsx` renders 118 distinct `activeRoute` values; the sidebar (`OGAME_NAV_SECTIONS` in `src/components/Sidebar.tsx`) lists 110 menu items. The 8 App-only routes are `account`, `account-info`, `dev-credits`, `nms-universe`, `planetary-invasion`, `plunge`, `empire-history` and `cron-logs`.
- **Existing gates before this change:**
  - Admin Systems section hidden from non-admins in the sidebar.
  - The `turn-system` render path, and the grouped admin/cron routes, render only for admins (client-side guard).
  - `src/game/progression.ts` held a 12-entry feature registry (`evaluateFeatureAccess`) covered by `npm run progression:smoke`, but nothing in the UI used it.
  - `src/game/progression-tiers.ts` and `src/game/story-chapters.ts` are 72-tier planning sheets with placeholder story titles and no route mapping. They were left unchanged.
- **Player level:** `PlayerProfile` had `rankLevel` (static, starts at 3) and an optional, unused `level`. There was no XP field. `glory` is labelled "XP" on the Missions screen and earned from buildings, research, battles and missions, but it is also *spent* (Planetary Invasion), so it cannot serve as a level.

## How it works now

- **One table:** `src/game/levelLocks.ts` → `ROUTE_LEVEL_LOCKS` maps all 98 player routes to the commander level that unlocks them. `ADMIN_ONLY_ROUTES` lists the 20 admin routes, which stay behind the admin check. `FEATURE_PROGRESSION` in `progression.ts` is now generated from this table, keeping the earlier building/technology prerequisites as extra (server-side) requirements.
- **Commander XP:** `profile.commanderXp` is lifetime XP. Every glory *gain* is also banked as XP, and each manually settled turn gives `COMMANDER_XP_PER_TURN` (20). XP never goes down. Saves made before this change are seeded from current glory; new profiles start at 0 XP (level 1). Curve: `xpForCommanderLevel(L) = round(150 · (L−1)^1.8)`, capped at level 50.
- **Enforcement:**
  - The sidebar (expanded and collapsed flyout) greys out locked entries and shows a lock badge with `Lv N`.
  - In `App.tsx`, a locked route renders `LevelLockedPanel` ("Locked — reach level N") instead of the screen, whether you arrive from the sidebar, the command deck, the route bar or a direct `setActiveRoute`.
  - Admins bypass level locks. This is client-side only: server commands still need to evaluate the same rules.
- **Story:** `src/game/storyCampaign.ts` holds "The Long Dawn", 6 chapters with one beat per unlock milestone (17 beats). Reaching a milestone queues its beat in `StoryBeatModal`, and several beats play in order if you jump levels. `profile.storySeenLevel` records what has been shown. Missions → **Commander Story** tab (`StoryLogPanel`) lists every chapter; revealed beats can be re-read, and locked ones show their level.
- **Tests:** `npm run progression:smoke` checks:
  - every sidebar item and App route has a level lock or is admin-only;
  - every lock matches a real route and a registered feature;
  - the early-to-late ordering;
  - boundary levels and admin bypass;
  - the XP curve round-trip;
  - exactly one story beat per unlock milestone.

## Unlock table

| Level | Total XP | Story beat | Screens that unlock (route id) |
|---|---|---|---|
| 1 | 0 | Ch.1 "Landfall" | Empire Overview (`dashboard`), Missions & Chapter Quests (`missions`), Strategic Codex & GDD (`codex-doc`), Civilization & Population (`civilization`), Resource Vault & Reserves (`resources`), Protected, Inventory & Equipment Stash (`stash-vaults`), Resource Income & Mines (`income`), Communications & Messages (`messages`), Holonet News Network (`galactic-news`), Galactic Leaderboards (`rankings`), Sovereign Realm Dossier (`player-profile`), Account (`account`), Account Info (`account-info`), Account Settings (`account-settings`), Multi-Account Profiles (`account-profiles`), Race & Government Faction (`race`), Sanctuary / Vacation Shield (`vacation`), Store & Battle Pass (`store-battlepass`), Development Credits (`dev-credits`) |
| 2 | 150 | Ch.1 "Scaffolds in the Snow" | Construction Yard (`construction-yard`), Storage Silos & Warehouses (`storage-upgrades`), Power Grid & Energy Network (`power-grid`), Mines & Nanite Factories (`factories`), Master Tech Tree (`tech-tree`) |
| 3 | 522 | Ch.1 "The Waking" | Research Lab Facilities (`tech-library`), Population & Rationing (`population`), Food & Water Life Support (`life-support`), Workforce & Academy Hub (`workforce-academy`), Orbital Shipyard Drydocks (`shipyard`) |
| 4 | 1,084 | Ch.2 "The Charter" | Government Systems (`government-system`), Automated Industry (AIC) (`aic-system`), Enlistment Terminal (`academy-enlistment`), 90-Role Imperial Roster (`workforce-roster`), Resource Exchange Market (`resource-exchange`), Imperial Bank & Vault (`bank-vault`) |
| 5 | 1,819 | Ch.2 "Forge and Bulwark" | Ship Production Lines (`unit-production`), Industrial Miners & Transports (`miners`), Planetary Defense Grid (`defenses`), Shield Domes & Deflectors (`shields`), Ground Defense Batteries (`weapons`), Hardened Fortifications (`armors`), Forge & Masterworks Anvil (`tempering-forge`) |
| 6 | 2,718 | Ch.2 "First Flight" | Fleet Combat Units (`units`), Fleet Dispatch & Targets (`targets`), Combat Reports & Attack Log (`attack-log`), Military Fleet Scores (`military-stats`), Weapons Technology (`tech-offense`), Shield & Armor Tech (`tech-defense`), Colonial World Nexus (`planet-list`), All Worlds Comparison Matrix (`planet-bonuses`) |
| 7 | 3,774 | Ch.3 "The Listening Post" | Espionage Probes & Scans (`spy`), Espionage Reports & Intercepts (`spy-log`), Covert Espionage Tech (`tech-covert`), Anti-Covert Counter-Sensors (`tech-anti-covert`), Procurement Catalog (`weapon-market`), 6 Specialized Wings (`academy-wings`), Readiness Drills & Auto-Draft (`academy-drills`), Planetary Hazards (`hazards`) |
| 8 | 4,980 | Ch.3 "Moonrise" | 90-Class Unit & Ship Roster (`unit-roster-90`), Ship Fitting & 6-Type Armor (`ship-fitting`), Colonial Power Grid (`planet-power`), Colonial Defenses Grid (`planet-defenses`), Moon Bases & Sensor Phalanx (`moon-bases`), Deep Space Expeditions (`expeditions`), Colonial Plunge System (`colonial-plunge`), Colonial Plunge (`plunge`), A-Z Planetary Encyclopedia (`stellar-encyclopedia`) |
| 10 | 7,829 | Ch.3 "The Pale Concord" | Master Facilities Hub (`master-upgrades`), Blueprints and Research Lab (`eve-blueprints`), Galactic Technology Archive (`tech-archive`), Covert Sabotage Ops (`sabotage`), Enemy Intelligence Dossier (`enemy-intelligence`), Strategic Intel Codex (`intel-codex`), Mercenary Guild Market (`mercenary-market`), Alliance Depot & Repair (`repair`), Commander HQ & Officers (`commander-hq`) |
| 12 | 11,236 | Ch.4 "The Ring Beneath the Ice" | Transit Gates & Jump Relays (`stargate-network`), Gate Tokens & Anomalies (`gate-tokens`), Deep Space Reconnaissance (`exploration`), Diplomacy & Treaties (`diplomacy`), Alliance Headquarters (`alliances`) |
| 14 | 15,177 | Ch.4 "A Table of Many Chairs" | Guilds, Raids & Adventures (`mmorpg-ogame`), Orbital Starbases (`space-stations`), Alien Races (`stargate-npc-races`), Seasonal Commander Roster (`commander-gacha`) |
| 16 | 19,636 | Ch.5 "Keels of Giants" | Relics & Ancient Artifacts (`stargate-relics`), Hyperspace & Motherships (`hyperspace-systems`), Mothership Nexus Overview (`ship`), Mothership Modular Subsystems (`modules`), Titan & Flagship Vessels (`super-units`), Planetary Invasion (`planetary-invasion`) |
| 18 | 24,598 | Ch.5 "The Hollow Admiral" | System Lords & PvE Raids (`stargate-system-lords`), Nemesis Warlord System (`nemesis-system`), Galaxy & Arc Bosses (`add-worlds-bosses`) |
| 20 | 30,050 | Ch.5 "The Lantern" | Stellar Megastructures (`megastructures`) |
| 22 | 35,982 | Ch.6 "Uncharted" | Procedural Universe Explorer (`nms-universe`) |
| 24 | 42,384 | Ch.6 "Many Skies" | 30 Universes & 90 Galaxies (`universe`) |
| 30 | 64,329 | Ch.6 "The Long Dawn" | Ascension Chamber (`ascension`) |

## Still open

- Server-side enforcement: authoritative command handlers should reject actions on locked features using `evaluateFeatureAccess`.
- Commander XP and `storySeenLevel` persist only in the client save (localStorage), like the rest of the profile.
- Level thresholds and the XP curve are first-pass balance values.
- Sub-tab buttons inside some views (for example, the command deck sibling tabs) can still *link* to a locked route; the route guard catches it and shows the lock panel, but those buttons don't show a lock badge.
