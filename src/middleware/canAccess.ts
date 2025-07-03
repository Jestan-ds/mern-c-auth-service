import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../types';
import createHttpError from 'http-errors';

export const canAccess = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    const roleFromToken = authReq.auth?.role; // Assuming req.user is populated by authentication middleware
    if (!roles.includes(roleFromToken)) {
      const error = createHttpError(403, 'Forbidden');
      next(error);
      return;
    } else {
      next();
    }
  };
};
