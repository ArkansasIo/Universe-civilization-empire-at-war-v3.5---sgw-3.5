import { strict as assert } from 'node:assert';
import { generateGalaxy } from '../src/engine/galaxy';
import { naturalIncome, nextUPCost, bankCapacity } from '../src/engine/economy';
import { resolveCombat } from '../src/engine/combatResolver';
import { travelSeconds } from '../src/engine/fleetEngine';
import { researchCost } from '../src/engine/researchEngine';

const a=generateGalaxy('smoke-seed',25,1); const b=generateGalaxy('smoke-seed',25,1);
assert.deepEqual(a,b);
assert.equal(naturalIncome(10,5),600);
assert.equal(nextUPCost(2),20000);
assert.equal(bankCapacity(100),7200);
assert.ok(travelSeconds({galaxy:1,system:1,planet:1},{galaxy:1,system:2,planet:1},100)>0);
assert.equal(researchCost({id:'t',name:'T',maxLevel:10,baseCost:100,costGrowth:2,baseSeconds:10,prerequisites:[]},3),400);
const result=resolveCombat([{id:'a',count:10,attack:100,defense:50,hull:1000,accuracy:1}],[{id:'d',count:10,attack:50,defense:50,hull:1000,accuracy:1}],'battle-seed');
assert.ok(result.rounds>0); assert.equal(result.seed,'battle-seed');
console.log('authoritative engine smoke: PASS');
