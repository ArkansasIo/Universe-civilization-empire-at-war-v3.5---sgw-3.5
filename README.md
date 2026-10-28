# Aetherion Expanse

> **Original science-fiction 4X strategy and persistent-galaxy MMO**  
> A standalone universe featuring original civilizations, alien cultures, technology, exploration, and fleet warfare.

---

## 🌌 Overview

**Universe Civilization: Empire at Wars** is an expansive, web-based 4X space strategy game and command center simulation. Players govern an interstellar civilization, manage strategic resources, conduct scientific research, build planet-shattering armadas, dial Transit Gates, command mothership titans, and battle across a persistent galaxy grid.

## ⚡ Core Features & Systems

### 1. Faction Races & Governments
- **5 Iconic Races**:
  - 🛸 **Veyr Ascendancy**: +25% Technology, Teleportation & Advanced Shielding.
  - 🐍 **Kharvaxi Dominion**: +25% Military Might, Sarcophagus Healing, Jaffa Armadas.
  - 🤖 **Myriad Synth Collective**: +30% Unit Production, Nanite Replication, Rapid Fleet Forging.
  - 🌍 **Solari Concord (Earth)**: +20% Espionage & Covert Recon, Trinium Composite Tech.
  - 🏛️ **Thalori Enclave**: +25% Income & Planetary Ion Cannons, Phase-Shifting Tech.
- **Galactic Governments**: Military Junta, Technocracy, Feudal Empire, Republic, and Cybernetic Hive Mind each offering distinct economic and combat modifiers.
- **Multi-Commander Profiles**: Switch between saved commander profiles, customize commander details, and review career statistics.

### 2. Economy & Empire Management
- **Resources**: Aetherite, Banked Aetherite, Metal, Crystal, Deuterium, Energy, and Dark Matter.
- **Imperial Bank & Vault**: Deposit and withdraw Aetherite with race-based interest rules.
- **Threat Readiness Readiness Levels**: Adjust empire defense posture.
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

### 6. Hyperspace, Transit Gates & Arkships
- **Mothership Command**: Capital-ship profiles, subsystem allocation, and flagship abilities.
- **Tactical Abilities**: Bombardment, shield overcharge, micro-jumps, and fleet auras.
- **Transit Gate Network**: Seven-symbol gate addresses, network routes, and iris controls.

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

> **CI note:** GitHub Pages deployment requires `npm run lint` (TypeScript type-checking) and `npm run build` to pass. A successful deployment confirms those workflow steps passed for that run.

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
- [Transit Gate Network](docs/STARGATE_NETWORK.md)
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
