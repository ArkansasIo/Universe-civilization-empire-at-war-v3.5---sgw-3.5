export type CraftingMaterialTier = "basic" | "refined" | "rare" | "epic" | "legendary" | "mythic";
export type CraftingMaterialFamily = "ore" | "rune" | "core" | "crystal" | "boss" | "tool";
export interface CraftingMaterialDefinition {
  id:string;
  name:string;
  description:string;
  tier:CraftingMaterialTier;
  family:CraftingMaterialFamily;
  maxStack:number;
  vendorValue:number;
  sources:string[];
  tags:string[];
}

export const TEMPERING_MATERIALS:CraftingMaterialDefinition[] = [
  {id:"tempering-stone",name:"Tempering Stone",description:"A stable abrasive crystal used to reinforce equipment at low and mid temper levels.",tier:"basic",family:"ore",maxStack:999,vendorValue:25,sources:["mining","dungeons","salvage","world-mobs"],tags:["tempering"]},
  {id:"refined-ore",name:"Refined Ore",description:"Purified metal prepared for high-pressure tempering.",tier:"refined",family:"ore",maxStack:999,vendorValue:100,sources:["refining","dungeons","mining"],tags:["tempering"]},
  {id:"star-metal",name:"Star Metal",description:"Meteoric alloy with exceptional resonance under enchantment heat.",tier:"rare",family:"ore",maxStack:999,vendorValue:500,sources:["asteroid-fields","raids","world-events"],tags:["tempering","masterworking"]},
  {id:"astral-core",name:"Astral Core",description:"Condensed stellar energy used for advanced equipment reinforcement.",tier:"epic",family:"core",maxStack:999,vendorValue:1500,sources:["elite-dungeons","world-bosses","raids"],tags:["tempering","masterworking"]},
  {id:"primordial-ingot",name:"Primordial Ingot",description:"Ancient alloy capable of surviving extreme masterwork forging.",tier:"legendary",family:"ore",maxStack:999,vendorValue:5000,sources:["raid-bosses","mythic-dungeons","seasonal-events"],tags:["tempering","masterworking"]},
  {id:"void-crystal",name:"Void Crystal",description:"A volatile crystal used to create precision masterwork channels.",tier:"legendary",family:"crystal",maxStack:999,vendorValue:7500,sources:["void-zones","raid-bosses","world-events"],tags:["masterworking"]},
  {id:"masterwork-core",name:"Masterwork Core",description:"The central forging component required for masterwork ranks.",tier:"epic",family:"core",maxStack:999,vendorValue:2500,sources:["salvage-epic","raids","crafting"],tags:["masterworking"]},
  {id:"world-boss-heart",name:"World Boss Heart",description:"A rare boss component carrying enough energy to complete the highest masterwork ranks.",tier:"mythic",family:"boss",maxStack:99,vendorValue:25000,sources:["world-bosses","raid-bosses"],tags:["masterworking","boss"]},
  {id:"warding-rune",name:"Warding Rune",description:"Protects an item from level loss when a protected temper attempt fails.",tier:"rare",family:"rune",maxStack:999,vendorValue:800,sources:["rune-crafting","dungeons","events"],tags:["protection","tempering"]},
  {id:"greater-warding-rune",name:"Greater Warding Rune",description:"Advanced protection for dangerous temper levels.",tier:"epic",family:"rune",maxStack:999,vendorValue:2500,sources:["rune-crafting","raids","events"],tags:["protection","tempering"]},
  {id:"masterwork-seal",name:"Masterwork Seal",description:"Prevents a failed masterwork attempt from applying its downgrade or damage penalty.",tier:"legendary",family:"rune",maxStack:999,vendorValue:10000,sources:["raid-vendors","seasonal-content","masterwork-crafting"],tags:["protection","masterworking"]},
  {id:"repair-kit",name:"Arcane Repair Kit",description:"Restores crafting damage caused by failure policies that damage equipment.",tier:"refined",family:"tool",maxStack:999,vendorValue:250,sources:["crafting","vendors","salvage"],tags:["repair"]},
];

export const CRAFTING_MATERIALS:Record<string,CraftingMaterialDefinition> = Object.fromEntries(TEMPERING_MATERIALS.map(material=>[material.id,material]));
export function getCraftingMaterial(id:string):CraftingMaterialDefinition|undefined{return CRAFTING_MATERIALS[id];}
export function validateMaterialQuantity(id:string,quantity:number):boolean{return Number.isInteger(quantity)&&quantity>=0&&Boolean(CRAFTING_MATERIALS[id]);}
export function materialSellValue(id:string,quantity:number):number{return validateMaterialQuantity(id,quantity)?(CRAFTING_MATERIALS[id]?.vendorValue??0)*quantity:0;}
