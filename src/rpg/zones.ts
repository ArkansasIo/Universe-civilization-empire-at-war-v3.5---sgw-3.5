export type Biome='temperate'|'desert'|'ice'|'jungle'|'volcanic'|'void'|'oceanic'|'urban'|'asteroid';
export type ZoneDefinition={id:string;name:string;biome:Biome;levelMin:number;levelMax:number;description:string;encounters:string[];resourceTags:string[];connectedZoneIds:string[];pvpEnabled:boolean};
export const zones:ZoneDefinition[]=[
{id:'home-sector',name:'Home Sector',biome:'temperate',levelMin:1,levelMax:10,description:'A protected starting sector.',encounters:['riftlands-skirmish'],resourceTags:['metal','crystal'],connectedZoneIds:['riftlands'],pvpEnabled:false},
{id:'riftlands',name:'Riftlands',biome:'void',levelMin:10,levelMax:25,description:'Reality fractures surround abandoned Stargate installations.',encounters:['riftlands-skirmish'],resourceTags:['darkMatter','naquadah'],connectedZoneIds:['home-sector','naquadah-vault'],pvpEnabled:true},
{id:'naquadah-vault',name:'Naquadah Vault',biome:'urban',levelMin:25,levelMax:35,description:'A fortified underground facility.',encounters:['naquadah-vault'],resourceTags:['naquadah','energy'],connectedZoneIds:['riftlands','system-lord-sanctum'],pvpEnabled:false},
{id:'system-lord-sanctum',name:'System Lord Sanctum',biome:'volcanic',levelMin:45,levelMax:60,description:'A raid zone surrounding a corrupted command fortress.',encounters:['system-lord-crusade'],resourceTags:['naquadah','darkMatter'],connectedZoneIds:['naquadah-vault'],pvpEnabled:true},
];
export function getZone(id:string){return zones.find(z=>z.id===id);}
export function recommendedZones(level:number){return zones.filter(z=>level>=z.levelMin-3&&level<=z.levelMax+3);}
