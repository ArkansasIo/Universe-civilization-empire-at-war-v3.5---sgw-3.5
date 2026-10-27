export interface AuthUser { id:string; username:string; email:string; roles:string[]; banned:boolean; }
export interface Session { id:string; userId:string; expiresAt:number; createdAt:number; }
export interface AuthRepository { findUserByLogin(login:string):Promise<AuthUser|null>; createSession(userId:string, ttlMs:number):Promise<Session>; revokeSession(sessionId:string):Promise<void>; findSession(sessionId:string):Promise<Session|null>; }
export function assertAuthorized(user:AuthUser|null, requiredRole?:string):AuthUser { if(!user || user.banned) throw new Error('UNAUTHORIZED'); if(requiredRole && !user.roles.includes(requiredRole)) throw new Error('FORBIDDEN'); return user; }
