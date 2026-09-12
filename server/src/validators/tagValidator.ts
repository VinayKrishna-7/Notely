import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50),
  color: z.string().optional(),
});

export const updateTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50),
  color: z.string().optional(),
});
