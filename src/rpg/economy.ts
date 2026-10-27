export type CurrencyWallet={naquadah:number;gold:number;tokens:number;arenaTokens:number;raidTokens:number};
export type Transaction={id:string;playerId:string;currency:keyof CurrencyWallet;amount:number;reason:string;createdAt:number;idempotencyKey:string};
export function applyCurrency(wallet:CurrencyWallet,currency:keyof CurrencyWallet,delta:number):CurrencyWallet{const next=Math.floor((wallet[currency]??0)+delta);if(next<0)throw new Error(`Insufficient ${currency}`);return{...wallet,[currency]:next};}
export function validateTransaction(tx:Transaction):void{if(!tx.playerId||!tx.idempotencyKey||!Number.isSafeInteger(tx.amount)||!tx.reason)throw new Error('Invalid economy transaction');}
