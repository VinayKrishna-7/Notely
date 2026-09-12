import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { Note } from '../models/Note';
import { Tag } from '../models/Tag';
import { ENV } from '../config/env';
import { sendSuccess, sendError } from '../utils/response';
import { AppError } from '../utils/AppError';
import { AuthenticatedRequest } from '../middleware/auth';

function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });
}

export const authController = {
  // POST /api/auth/register
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new AppError('An account with this email address already exists. Please sign in instead.', 400);
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
      });

      const token = generateToken(user._id.toString());

      return sendSuccess(
        res,
        {
          user: user.toJSON(),
          token,
        },
        201,
        'Account created successfully'
      );
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        throw new AppError('No account found with this email address. Please check your spelling or create an account.', 401);
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new AppError('Incorrect password. Please verify your password and try again.', 401);
      }

      const token = generateToken(user._id.toString());

      return sendSuccess(
        res,
        {
          user: user.toJSON(),
          token,
        },
        200,
        'Logged in successfully'
      );
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/logout
  async logout(_req: Request, res: Response) {
    return sendSuccess(res, { message: 'Logged out successfully' }, 200);
  },

  // GET /api/auth/me
  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      return sendSuccess(res, req.user.toJSON(), 200);
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/auth/profile
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const { name, avatar, themePreference, editorPreferences, clockPreferences } = req.body;

      if (name) req.user.name = name;
      if (avatar !== undefined) req.user.avatar = avatar;
      if (themePreference) req.user.themePreference = themePreference;
      if (editorPreferences) {
        req.user.editorPreferences = {
          ...req.user.editorPreferences,
          ...editorPreferences,
        };
      }
      if (clockPreferences) {
        req.user.clockPreferences = {
          ...(req.user.clockPreferences || {
            enabled: true,
            style: 'minimal',
            timeFormat: '12h',
            showSeconds: false,
            showDate: false,
            accent: 'neutral',
          }),
          ...clockPreferences,
        };
      }

      await req.user.save();

      return sendSuccess(res, req.user.toJSON(), 200, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/auth/password
  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const { currentPassword, newPassword } = req.body;

      const userWithPassword = await User.findById(req.user._id).select('+password');
      if (!userWithPassword) throw new AppError('User not found', 404);

      const isMatch = await userWithPassword.comparePassword(currentPassword);
      if (!isMatch) {
        throw new AppError('Current password is incorrect', 400);
      }

      userWithPassword.password = newPassword;
      await userWithPassword.save();

      return sendSuccess(res, null, 200, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/auth/account
  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const { password } = req.body;
      const userWithPassword = await User.findById(req.user._id).select('+password');
      if (!userWithPassword) throw new AppError('User not found', 404);

      const isMatch = await userWithPassword.comparePassword(password);
      if (!isMatch) {
        throw new AppError('Incorrect password. Account deletion aborted.', 400);
      }

      // Delete user's notes and tags
      await Note.deleteMany({ user: req.user._id });
      await Tag.deleteMany({ user: req.user._id });
      await User.findByIdAndDelete(req.user._id);

      return sendSuccess(res, null, 200, 'Account and all data deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
