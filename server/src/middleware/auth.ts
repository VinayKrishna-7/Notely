import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { User, IUser } from '../models/User';
import { sendError } from '../utils/response';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export async function protect(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // Check Bearer authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Not authorized. Please sign in to access this resource.', 401);
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: string };
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return sendError(res, 'The user belonging to this token no longer exists.', 401);
    }

    req.user = currentUser;
    next();
  } catch (err: any) {
    return sendError(res, 'Invalid or expired token. Please sign in again.', 401);
  }
}
