export interface FabricatorMaterialCost { itemId:string; quantity:number; }
export interface FabricatorRecipe { id:string; name:string; fabricatorId:string; requiredTier:number; durationSeconds:number; currencyCost:number; materials:FabricatorMaterialCost[]; outputQuantity:number; }
export const FABRICATOR_RECIPES:FabricatorRecipe[] = [
  {
    "id": "building-frame",
    "name": "Building Frame",
    "fabricatorId": "construction-yard",
    "requiredTier": 1,
    "durationSeconds": 60,
    "currencyCost": 1000,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 10
      },
      {
        "itemId": "tempering-stone",
        "quantity": 2
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "reinforced-foundation",
    "name": "Reinforced Foundation",
    "fabricatorId": "construction-yard",
    "requiredTier": 1,
    "durationSeconds": 120,
    "currencyCost": 2500,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 25
      },
      {
        "itemId": "star-metal",
        "quantity": 2
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "power-grid-node",
    "name": "Power Grid Node",
    "fabricatorId": "construction-yard",
    "requiredTier": 1,
    "durationSeconds": 90,
    "currencyCost": 1800,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 12
      },
      {
        "itemId": "fusion-cell",
        "quantity": 1
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "defense-tower-kit",
    "name": "Defense Tower Kit",
    "fabricatorId": "construction-yard",
    "requiredTier": 2,
    "durationSeconds": 240,
    "currencyCost": 8000,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 40
      },
      {
        "itemId": "star-metal",
        "quantity": 5
      },
      {
        "itemId": "masterwork-core",
        "quantity": 1
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "ship-hull-frame",
    "name": "Ship Hull Frame",
    "fabricatorId": "shipyard",
    "requiredTier": 1,
    "durationSeconds": 180,
    "currencyCost": 5000,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 40
      },
      {
        "itemId": "star-metal",
        "quantity": 4
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "ion-engine-module",
    "name": "Ion Engine Module",
    "fabricatorId": "shipyard",
    "requiredTier": 1,
    "durationSeconds": 240,
    "currencyCost": 7000,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 25
      },
      {
        "itemId": "astral-core",
        "quantity": 2
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "ship-armor-plating",
    "name": "Ship Armor Plating",
    "fabricatorId": "shipyard",
    "requiredTier": 1,
    "durationSeconds": 150,
    "currencyCost": 4500,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 30
      },
      {
        "itemId": "star-metal",
        "quantity": 3
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "shield-emitter",
    "name": "Shield Emitter",
    "fabricatorId": "shipyard",
    "requiredTier": 2,
    "durationSeconds": 300,
    "currencyCost": 12000,
    "materials": [
      {
        "itemId": "astral-core",
        "quantity": 3
      },
      {
        "itemId": "masterwork-core",
        "quantity": 1
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "weapon-tempering-module",
    "name": "Weapon Tempering Module",
    "fabricatorId": "tempering-forge",
    "requiredTier": 1,
    "durationSeconds": 120,
    "currencyCost": 3000,
    "materials": [
      {
        "itemId": "tempering-stone",
        "quantity": 10
      },
      {
        "itemId": "refined-ore",
        "quantity": 5
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "armor-tempering-module",
    "name": "Armor Tempering Module",
    "fabricatorId": "tempering-forge",
    "requiredTier": 1,
    "durationSeconds": 120,
    "currencyCost": 3000,
    "materials": [
      {
        "itemId": "tempering-stone",
        "quantity": 10
      },
      {
        "itemId": "refined-ore",
        "quantity": 5
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "jewelry-tempering-module",
    "name": "Jewelry Tempering Module",
    "fabricatorId": "tempering-forge",
    "requiredTier": 2,
    "durationSeconds": 180,
    "currencyCost": 5500,
    "materials": [
      {
        "itemId": "tempering-stone",
        "quantity": 12
      },
      {
        "itemId": "star-metal",
        "quantity": 2
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "rune-tempering-module",
    "name": "Rune Tempering Module",
    "fabricatorId": "tempering-forge",
    "requiredTier": 2,
    "durationSeconds": 180,
    "currencyCost": 6000,
    "materials": [
      {
        "itemId": "tempering-stone",
        "quantity": 8
      },
      {
        "itemId": "astral-core",
        "quantity": 1
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "masterwork-core-module",
    "name": "Masterwork Core Module",
    "fabricatorId": "masterwork-forge",
    "requiredTier": 2,
    "durationSeconds": 300,
    "currencyCost": 15000,
    "materials": [
      {
        "itemId": "masterwork-core",
        "quantity": 4
      },
      {
        "itemId": "star-metal",
        "quantity": 5
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "precision-hammer-array",
    "name": "Precision Hammer Array",
    "fabricatorId": "masterwork-forge",
    "requiredTier": 2,
    "durationSeconds": 240,
    "currencyCost": 11000,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 20
      },
      {
        "itemId": "masterwork-core",
        "quantity": 2
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "resonance-lock",
    "name": "Resonance Lock",
    "fabricatorId": "masterwork-forge",
    "requiredTier": 3,
    "durationSeconds": 360,
    "currencyCost": 25000,
    "materials": [
      {
        "itemId": "void-crystal",
        "quantity": 3
      },
      {
        "itemId": "masterwork-core",
        "quantity": 3
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "signature-finish-kit",
    "name": "Signature Finish Kit",
    "fabricatorId": "masterwork-forge",
    "requiredTier": 3,
    "durationSeconds": 420,
    "currencyCost": 30000,
    "materials": [
      {
        "itemId": "primordial-ingot",
        "quantity": 2
      },
      {
        "itemId": "masterwork-core",
        "quantity": 4
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "refined-ore-batch",
    "name": "Refined Ore Batch",
    "fabricatorId": "refinery",
    "requiredTier": 1,
    "durationSeconds": 120,
    "currencyCost": 1000,
    "materials": [
      {
        "itemId": "raw-ore",
        "quantity": 20
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "star-metal-ingot",
    "name": "Star Metal Ingot",
    "fabricatorId": "refinery",
    "requiredTier": 2,
    "durationSeconds": 240,
    "currencyCost": 5000,
    "materials": [
      {
        "itemId": "raw-ore",
        "quantity": 30
      },
      {
        "itemId": "astral-core",
        "quantity": 1
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "void-crystal-lens",
    "name": "Void Crystal Lens",
    "fabricatorId": "refinery",
    "requiredTier": 3,
    "durationSeconds": 360,
    "currencyCost": 15000,
    "materials": [
      {
        "itemId": "void-crystal",
        "quantity": 4
      },
      {
        "itemId": "refined-ore",
        "quantity": 10
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "primordial-alloy",
    "name": "Primordial Alloy",
    "fabricatorId": "refinery",
    "requiredTier": 3,
    "durationSeconds": 480,
    "currencyCost": 25000,
    "materials": [
      {
        "itemId": "primordial-ingot",
        "quantity": 3
      },
      {
        "itemId": "void-crystal",
        "quantity": 2
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "blueprint-data-core",
    "name": "Blueprint Data Core",
    "fabricatorId": "research-lab",
    "requiredTier": 1,
    "durationSeconds": 120,
    "currencyCost": 2000,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 5
      },
      {
        "itemId": "masterwork-core",
        "quantity": 1
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "module-research-pack",
    "name": "Module Research Pack",
    "fabricatorId": "research-lab",
    "requiredTier": 2,
    "durationSeconds": 240,
    "currencyCost": 7000,
    "materials": [
      {
        "itemId": "astral-core",
        "quantity": 2
      },
      {
        "itemId": "star-metal",
        "quantity": 3
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "advanced-schematic",
    "name": "Advanced Schematic",
    "fabricatorId": "research-lab",
    "requiredTier": 3,
    "durationSeconds": 480,
    "currencyCost": 20000,
    "materials": [
      {
        "itemId": "void-crystal",
        "quantity": 2
      },
      {
        "itemId": "masterwork-core",
        "quantity": 3
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "fusion-cell",
    "name": "Fusion Cell",
    "fabricatorId": "power-plant",
    "requiredTier": 1,
    "durationSeconds": 120,
    "currencyCost": 1500,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 8
      },
      {
        "itemId": "astral-core",
        "quantity": 1
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "power-conduit",
    "name": "Power Conduit",
    "fabricatorId": "power-plant",
    "requiredTier": 1,
    "durationSeconds": 90,
    "currencyCost": 1200,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 10
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "reactor-control-unit",
    "name": "Reactor Control Unit",
    "fabricatorId": "power-plant",
    "requiredTier": 2,
    "durationSeconds": 240,
    "currencyCost": 8000,
    "materials": [
      {
        "itemId": "star-metal",
        "quantity": 4
      },
      {
        "itemId": "masterwork-core",
        "quantity": 1
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "turret-assembly",
    "name": "Turret Assembly",
    "fabricatorId": "defense-foundry",
    "requiredTier": 1,
    "durationSeconds": 180,
    "currencyCost": 4000,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 20
      },
      {
        "itemId": "star-metal",
        "quantity": 2
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "kinetic-barrier",
    "name": "Kinetic Barrier",
    "fabricatorId": "defense-foundry",
    "requiredTier": 2,
    "durationSeconds": 240,
    "currencyCost": 8500,
    "materials": [
      {
        "itemId": "star-metal",
        "quantity": 5
      },
      {
        "itemId": "astral-core",
        "quantity": 2
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "point-defense-array",
    "name": "Point Defense Array",
    "fabricatorId": "defense-foundry",
    "requiredTier": 3,
    "durationSeconds": 360,
    "currencyCost": 18000,
    "materials": [
      {
        "itemId": "void-crystal",
        "quantity": 2
      },
      {
        "itemId": "masterwork-core",
        "quantity": 2
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "cargo-rack",
    "name": "Cargo Rack",
    "fabricatorId": "logistics-fabricator",
    "requiredTier": 1,
    "durationSeconds": 90,
    "currencyCost": 1000,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 12
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "warehouse-module",
    "name": "Warehouse Module",
    "fabricatorId": "logistics-fabricator",
    "requiredTier": 2,
    "durationSeconds": 240,
    "currencyCost": 7000,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 25
      },
      {
        "itemId": "star-metal",
        "quantity": 2
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "drone-control-unit",
    "name": "Drone Control Unit",
    "fabricatorId": "logistics-fabricator",
    "requiredTier": 2,
    "durationSeconds": 180,
    "currencyCost": 6000,
    "materials": [
      {
        "itemId": "masterwork-core",
        "quantity": 1
      },
      {
        "itemId": "astral-core",
        "quantity": 1
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "habitat-frame",
    "name": "Habitat Frame",
    "fabricatorId": "habitat-fabricator",
    "requiredTier": 1,
    "durationSeconds": 180,
    "currencyCost": 3500,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 25
      },
      {
        "itemId": "tempering-stone",
        "quantity": 5
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "life-support-unit",
    "name": "Life Support Unit",
    "fabricatorId": "habitat-fabricator",
    "requiredTier": 2,
    "durationSeconds": 240,
    "currencyCost": 7500,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 15
      },
      {
        "itemId": "astral-core",
        "quantity": 2
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "medical-bay-module",
    "name": "Medical Bay Module",
    "fabricatorId": "habitat-fabricator",
    "requiredTier": 2,
    "durationSeconds": 300,
    "currencyCost": 10000,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 20
      },
      {
        "itemId": "masterwork-core",
        "quantity": 1
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "construction-drone",
    "name": "Construction Drone",
    "fabricatorId": "robotics-foundry",
    "requiredTier": 2,
    "durationSeconds": 240,
    "currencyCost": 8000,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 15
      },
      {
        "itemId": "masterwork-core",
        "quantity": 1
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "repair-drone",
    "name": "Repair Drone",
    "fabricatorId": "robotics-foundry",
    "requiredTier": 2,
    "durationSeconds": 180,
    "currencyCost": 6500,
    "materials": [
      {
        "itemId": "refined-ore",
        "quantity": 10
      },
      {
        "itemId": "astral-core",
        "quantity": 1
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "fabricator-arm",
    "name": "Fabricator Arm",
    "fabricatorId": "robotics-foundry",
    "requiredTier": 3,
    "durationSeconds": 360,
    "currencyCost": 18000,
    "materials": [
      {
        "itemId": "star-metal",
        "quantity": 5
      },
      {
        "itemId": "masterwork-core",
        "quantity": 2
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "composite-plate",
    "name": "Composite Plate",
    "fabricatorId": "advanced-composites",
    "requiredTier": 3,
    "durationSeconds": 300,
    "currencyCost": 12000,
    "materials": [
      {
        "itemId": "primordial-ingot",
        "quantity": 1
      },
      {
        "itemId": "void-crystal",
        "quantity": 1
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "nanolattice-panel",
    "name": "Nanolattice Panel",
    "fabricatorId": "advanced-composites",
    "requiredTier": 3,
    "durationSeconds": 420,
    "currencyCost": 20000,
    "materials": [
      {
        "itemId": "void-crystal",
        "quantity": 3
      },
      {
        "itemId": "masterwork-core",
        "quantity": 2
      }
    ],
    "outputQuantity": 1
  },
  {
    "id": "adaptive-armor-module",
    "name": "Adaptive Armor Module",
    "fabricatorId": "advanced-composites",
    "requiredTier": 3,
    "durationSeconds": 480,
    "currencyCost": 26000,
    "materials": [
      {
        "itemId": "primordial-ingot",
        "quantity": 2
      },
      {
        "itemId": "void-crystal",
        "quantity": 3
      },
      {
        "itemId": "masterwork-core",
        "quantity": 2
      }
    ],
    "outputQuantity": 1
  }
];
