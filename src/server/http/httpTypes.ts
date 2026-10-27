import type { Request, Response } from 'express';

export interface AuthenticatedRequest extends Request {
  auth?: {
    playerId: string;
    username: string;
    sessionId: string;
  };
}

export interface JsonError {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}

export interface HttpRouteDependencies {
  validateSession?: (token: string) => Promise<{ playerId: string; username: string; id: string }>;
}

export type JsonHandler = (req: AuthenticatedRequest, res: Response) => void | Promise<void>;
