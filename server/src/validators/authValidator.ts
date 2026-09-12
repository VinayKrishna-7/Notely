import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const clockPreferencesSchema = z.object({
  enabled: z.boolean().optional(),
  style: z
    .enum(['minimal', 'dateTime', 'digital', 'compact', 'productivity', 'seconds', 'focus', 'analog'])
    .optional(),
  timeFormat: z.enum(['12h', '24h']).optional(),
  showSeconds: z.boolean().optional(),
  showDate: z.boolean().optional(),
  accent: z.enum(['neutral', 'accent', 'muted']).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().optional(),
  themePreference: z.enum(['light', 'dark', 'system']).optional(),
  editorPreferences: z
    .object({
      defaultMode: z.enum(['edit', 'split', 'preview']).optional(),
      autoSaveDelay: z.number().min(300).max(5000).optional(),
      density: z.enum(['comfortable', 'compact']).optional(),
    })
    .optional(),
  clockPreferences: clockPreferencesSchema.optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to confirm account deletion'),
});
