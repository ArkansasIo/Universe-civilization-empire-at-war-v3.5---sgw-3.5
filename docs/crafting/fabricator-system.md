# Fabricator and Building Module System

The system supports construction yards, shipyards, tempering and masterworking forges, refineries, research labs, power plants, defense foundries, logistics, habitats, robotics and advanced composites.

## Buildings
- **Construction Yard Fabricator** (`construction-yard`): Fabricates building frames, structural components and base modules.
- **Shipyard Fabricator** (`shipyard`): Builds ship hulls, engines, armor modules and fleet components.
- **Tempering Fabricator** (`tempering-forge`): Produces tempering modules, stones and reinforcement assemblies.
- **Masterworking Fabricator** (`masterwork-forge`): Builds masterwork cores, precision fixtures and high-tier upgrade modules.
- **Materials Refinery** (`refinery`): Refines ore and crystals into standardized fabrication feedstock.
- **Research and Blueprint Lab** (`research-lab`): Develops schematics, unlocks module tiers and improves fabrication efficiency.
- **Power Systems Fabricator** (`power-plant`): Builds generators, batteries, conduits and power distribution components.
- **Defense Foundry** (`defense-foundry`): Fabricates turrets, barriers, point-defense systems and defensive modules.
- **Logistics Fabricator** (`logistics-fabricator`): Builds storage, cargo, transport and automation components.
- **Habitat and Life-Support Fabricator** (`habitat-fabricator`): Builds habitat frames, life-support systems, medical and crew modules.
- **Robotics and Drone Foundry** (`robotics-foundry`): Produces construction drones, repair bots and automated fabrication arms.
- **Advanced Composite Fabricator** (`advanced-composites`): Builds composite plates, nanolattices and high-tier structural modules.

## Behavior
- Building definitions specify category, tier, queue slots and supported output identifiers.
- Recipes specify the required fabricator, tier, production duration, currency and material costs.
- Installation checks ownership input, building ID, tier and duplicate installation.
- Queueing checks ownership, online state, recipe compatibility, tier, queue capacity and inventory. Resources are deducted when a job is accepted.
- Jobs transition through queued, running, completed and cancelled states. Completion grants outputs only after the finish timestamp.
- Only queued jobs can be cancelled; this initial implementation does not refund resources.
- Helpers are deterministic and suited to service-level tests. Production must persist state and perform resource deduction, job transitions and output grants in server-owned atomic transactions.

## API
- `createFabricatorState(inventory)`, `listFabricatorBuildings()`, `listFabricatorRecipes(fabricatorId?)`
- `installFabricator(state, ownerId, buildingId, level?)`
- `queueFabrication(state, ownerId, fabricatorId, recipeId, quantity, now)`
- `completeFabrication(state, ownerId, jobId, now)`, `cancelFabrication(state, ownerId, jobId)`
- `setFabricatorOnline(state, ownerId, fabricatorId, online)`, `getFabricatorSummary(state)`

Run `npm run fabricator:smoke` and `npm run lint`.
