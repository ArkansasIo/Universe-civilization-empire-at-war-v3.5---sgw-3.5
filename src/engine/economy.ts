import { MAX_TURNS } from './constants';
import type { Resources } from './types';
export const naturalIncome = (untrainedUnits:number, minersAndLifers:number) => (untrainedUnits * 20) + (minersAndLifers * 80);
export const nextUPCost = (currentUP:number) => (currentUP * 5000) + 10000;
export const bankCapacity = (income:number) => income * 48 * 1.5;
export const applyIncome = (r:Resources, income:number):Resources => ({...r, naquadah:r.naquadah + income});
export const clampTurns = (turns:number) => Math.max(0, Math.min(MAX_TURNS, Math.floor(turns)));
export const generateTurns = (current:number, elapsedSeconds:number) => clampTurns(current + Math.floor(elapsedSeconds / 1800));
