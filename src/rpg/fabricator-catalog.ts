export type FabricatorCategory = "construction" | "shipyard" | "tempering" | "masterworking" | "refining" | "research" | "power" | "defense" | "logistics" | "habitat" | "robotics" | "composites";
export interface FabricatorBuildingDefinition { id:string; name:string; category:FabricatorCategory; description:string; tier:number; queueSlots:number; outputs:string[]; }
export const FABRICATOR_BUILDINGS:FabricatorBuildingDefinition[] = [
  {
    "id": "construction-yard",
    "name": "Construction Yard Fabricator",
    "category": "construction",
    "description": "Fabricates building frames, structural components and base modules.",
    "tier": 1,
    "queueSlots": 2,
    "outputs": [
      "building-frame",
      "reinforced-foundation",
      "power-grid-node",
      "defense-tower-kit"
    ]
  },
  {
    "id": "shipyard",
    "name": "Shipyard Fabricator",
    "category": "shipyard",
    "description": "Builds ship hulls, engines, armor modules and fleet components.",
    "tier": 1,
    "queueSlots": 2,
    "outputs": [
      "ship-hull-frame",
      "ion-engine-module",
      "ship-armor-plating",
      "shield-emitter"
    ]
  },
  {
    "id": "tempering-forge",
    "name": "Tempering Fabricator",
    "category": "tempering",
    "description": "Produces tempering modules, stones and reinforcement assemblies.",
    "tier": 1,
    "queueSlots": 2,
    "outputs": [
      "weapon-tempering-module",
      "armor-tempering-module",
      "jewelry-tempering-module",
      "rune-tempering-module"
    ]
  },
  {
    "id": "masterwork-forge",
    "name": "Masterworking Fabricator",
    "category": "masterworking",
    "description": "Builds masterwork cores, precision fixtures and high-tier upgrade modules.",
    "tier": 2,
    "queueSlots": 2,
    "outputs": [
      "masterwork-core-module",
      "precision-hammer-array",
      "resonance-lock",
      "signature-finish-kit"
    ]
  },
  {
    "id": "refinery",
    "name": "Materials Refinery",
    "category": "refining",
    "description": "Refines ore and crystals into standardized fabrication feedstock.",
    "tier": 1,
    "queueSlots": 3,
    "outputs": [
      "refined-ore-batch",
      "star-metal-ingot",
      "void-crystal-lens",
      "primordial-alloy"
    ]
  },
  {
    "id": "research-lab",
    "name": "Research and Blueprint Lab",
    "category": "research",
    "description": "Develops schematics, unlocks module tiers and improves fabrication efficiency.",
    "tier": 1,
    "queueSlots": 2,
    "outputs": [
      "blueprint-data-core",
      "module-research-pack",
      "advanced-schematic"
    ]
  },
  {
    "id": "power-plant",
    "name": "Power Systems Fabricator",
    "category": "power",
    "description": "Builds generators, batteries, conduits and power distribution components.",
    "tier": 1,
    "queueSlots": 2,
    "outputs": [
      "fusion-cell",
      "power-conduit",
      "reactor-control-unit"
    ]
  },
  {
    "id": "defense-foundry",
    "name": "Defense Foundry",
    "category": "defense",
    "description": "Fabricates turrets, barriers, point-defense systems and defensive modules.",
    "tier": 1,
    "queueSlots": 2,
    "outputs": [
      "turret-assembly",
      "kinetic-barrier",
      "point-defense-array"
    ]
  },
  {
    "id": "logistics-fabricator",
    "name": "Logistics Fabricator",
    "category": "logistics",
    "description": "Builds storage, cargo, transport and automation components.",
    "tier": 1,
    "queueSlots": 3,
    "outputs": [
      "cargo-rack",
      "warehouse-module",
      "drone-control-unit"
    ]
  },
  {
    "id": "habitat-fabricator",
    "name": "Habitat and Life-Support Fabricator",
    "category": "habitat",
    "description": "Builds habitat frames, life-support systems, medical and crew modules.",
    "tier": 1,
    "queueSlots": 2,
    "outputs": [
      "habitat-frame",
      "life-support-unit",
      "medical-bay-module"
    ]
  },
  {
    "id": "robotics-foundry",
    "name": "Robotics and Drone Foundry",
    "category": "robotics",
    "description": "Produces construction drones, repair bots and automated fabrication arms.",
    "tier": 2,
    "queueSlots": 2,
    "outputs": [
      "construction-drone",
      "repair-drone",
      "fabricator-arm"
    ]
  },
  {
    "id": "advanced-composites",
    "name": "Advanced Composite Fabricator",
    "category": "composites",
    "description": "Builds composite plates, nanolattices and high-tier structural modules.",
    "tier": 3,
    "queueSlots": 2,
    "outputs": [
      "composite-plate",
      "nanolattice-panel",
      "adaptive-armor-module"
    ]
  }
];
