# Universe Civilization: Empire at Wars

> **Galactic Command Interface & 4X Space MMO Simulator**  
> Inspired by classic browser space strategy games (*Game*, *Stargate: Universe Civilization*, *EVE Online*).

---

## 🌌 Overview

**Universe Civilization: Empire at Wars** is an expansive, web-based 4X space strategy game and command center simulation. Players govern an interstellar civilization, manage strategic resources, conduct scientific research, build planet-shattering armadas, dial Stargates, command mothership titans, and battle across a persistent galaxy grid.

## ⚡ Core Features & Systems

### 1. Faction Races & Governments
- **5 Iconic Races**:
  - 🛸 **Asgard**: +25% Technology, Teleportation & Advanced Shielding.
  - 🐍 **Goa'uld**: +25% Military Might, Sarcophagus Healing, Jaffa Armadas.
  - 🤖 **Replicator**: +30% Unit Production, Nanite Replication, Rapid Fleet Forging.
  - 🌍 **Tau'ri (Earth)**: +20% Espionage & Covert Recon, Trinium Composite Tech.
  - 🏛️ **Tollan**: +25% Income & Planetary Ion Cannons, Phase-Shifting Tech.
- **Galactic Governments**: Military Junta, Technocracy, Feudal Empire, Republic, and Cybernetic Hive Mind each offering distinct economic and combat modifiers.
- **Multi-Commander Profiles**: Switch between saved commander profiles, customize commander details, and review career statistics.

### 2. Economy & Empire Management
- **Resources**: Naquadah, Banked Naquadah, Metal, Crystal, Deuterium, Energy, and Dark Matter.
- **Imperial Bank & Vault**: Deposit and withdraw Naquadah with race-based interest rules.
- **DEFCON Readiness Levels**: Adjust empire defense posture.
- **Turn Scheduler**: Turn processing, production tick configuration, and execution logs.

### 3. Armory, Training & Unit Roster
- **Armory & Depot**: Tiered weapons, kinetic armor, energy shields, durability, and repair mechanics.
- **Unit Training**: Recruits, miners, lifers, assault infantry, garrisons, covert spies, and specialist units.
- **Unit Roster**: Faction-specific military units and combat roles.

### 4. Technology, Laboratories & Blueprint Manufacturing
- **Master Tech Tree**: Offense, Defense, Covert, and Anti-Covert disciplines.
- **Research Library**: Energy systems, hyperspace drives, graviton physics, and tachyon communications.
- **Blueprint Manufacturing**: Material- and time-efficiency research to optimize production costs and cycle times.

### 5. Galaxy & Combat Systems
- **Galaxy Navigation Grid**: Galaxies 1–9, solar systems 1–499, and 15 planetary orbital slots per system.
- **Espionage & Sensors**: Recon missions and sensor systems.
- **Missile Silos**: Strategic missile and planetary-defense mechanics.
- **Debris Recycling**: Recover resources after space battles.
- **Alliance Combat**: Coordinate joint fleet attacks and planetary defense operations.

### 6. Hyperspace, Stargates & Motherships
- **Mothership Command**: Capital-ship profiles, subsystem allocation, and flagship abilities.
- **Tactical Abilities**: Bombardment, shield overcharge, micro-jumps, and fleet auras.
- **Stargate Network**: Seven-symbol gate addresses, network routes, and iris controls.

### 7. Store & Battle Pass
- **Imperial Store**: Officer contracts, production boosters, and relic caches.
- **Seasonal Battle Pass**: Free and VIP progression tracks, daily objectives, and reward tiers.

### 8. Planetary & Lunar Encyclopedia
- Planetary classes A–Z, lunar archetypes, nine planet-size tiers, and interstellar phenomena.

---

## 🛠️ Tech Stack

- **Frontend**: React and TypeScript
- **Styling**: Tailwind CSS
- **Iconography**: Lucide React
- **Audio**: Web Audio API synthesizer (`src/sound.ts`)
- **Bundler**: Vite

## 🚀 Quick Start

Requirements: Node.js compatible with the Vite version in `package.json`, and npm.

```bash
npm install
npm run dev
```

Run local validation:

```bash
npm run lint
npm run build
```

> **CI note:** The current GitHub Pages workflow treats TypeScript type-checking as non-blocking while existing errors are addressed. A successful Pages deployment should not be treated as proof that `npm run lint` passes.

## 📚 Documentation

- [Master Game Design Document](GDD.md)
- [Systems Manual](SYSTEMS_MANUAL.md)
- [API and Data Specification](API_AND_DATA_SPEC.md)
- [API Contract](API_CONTRACT.md)
- [Architecture UML](ARCHITECTURE_UML.md)
- [Full Documentation](DOCUMENTATION.md)
- [Engineering Roadmap](docs/ENGINEERING_ROADMAP.md)
- [Release Verification Checklist](docs/RELEASE_VERIFICATION.md)
- [Security Specification](security_spec.md)
- [Source Code Reference](docs/SOURCE_CODE_REFERENCE.md)
- [Component Architecture](docs/COMPONENTS_ARCHITECTURE.md)
- [Data Models Reference](docs/DATA_MODELS_REFERENCE.md)
- [State Management and Engine](docs/STATE_MANAGEMENT_AND_ENGINE.md)
- [Combat Engine](docs/COMBAT_ENGINE.md)
- [Economy Specification](docs/ECONOMY_SPEC.md)
- [Stargate Network](docs/STARGATE_NETWORK.md)
- [UML Diagrams](docs/UML_DIAGRAMS.md)

## 📁 Main Source Layout

```text
.github/workflows/  GitHub Pages and Android build workflows
android/            Android wrapper and app packaging
backend/            Backend and database scaffolding
docs/               Engineering, system, and release documentation
src/App.tsx         Main game state and view composition
src/components/     Navigation, HUD, and gameplay views
src/data/           Data sets and system definitions
src/utils/          Shared game calculations and helpers
```

## 🧭 Engineering Status

This repository includes a browser game client and supporting backend/mobile scaffolding. GitHub Pages hosts a static client; persistent competitive multiplayer requires a trusted server to authorize and resolve resource transactions, turns, and combat. See the [Engineering Roadmap](docs/ENGINEERING_ROADMAP.md) for prioritized work.

## 📜 License & Acknowledgments

Universe Civilization: Empire at Wars is an educational game simulator inspired by classic browser space MMOs and science-fiction space strategy themes.
