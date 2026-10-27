export type Recipe={id:string;name:string;station:'forge'|'workbench'|'alchemy'|'research';inputs:Record<string,number>;output:{itemId:string;quantity:number};requiredLevel:number;craftTimeMs:number};
export const recipes:Recipe[]=[
{id:'forge-ashen-blade',name:'Forge Ashen Blade',station:'forge',inputs:{'naquadah-crystal':20,'rift-hide':8},output:{itemId:'ashen-blade-pve',quantity:1},requiredLevel:40,craftTimeMs:30000},
{id:'craft-revival-tonic',name:'Brew Phoenix Revival Tonic',station:'alchemy',inputs:{'naquadah-shard':2,'rift-hide':1},output:{itemId:'phoenix-revival-tonic',quantity:1},requiredLevel:10,craftTimeMs:5000},
];
export function canCraft(recipe:Recipe,materials:Record<string,number>,level:number):boolean{return level>=recipe.requiredLevel&&Object.entries(recipe.inputs).every(([id,n])=>(materials[id]??0)>=n);}
export function consumeRecipe(recipe:Recipe,materials:Record<string,number>):Record<string,number>{const next={...materials};for(const[id,n]of Object.entries(recipe.inputs))next[id]=(next[id]??0)-n;return next;}
export function findRecipe(id:string){return recipes.find(r=>r.id===id);}
