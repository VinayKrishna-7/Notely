import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().max(200).optional().default(''),
  content: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  color: z
    .enum(['default', 'rose', 'amber', 'emerald', 'sky', 'indigo', 'violet'])
    .optional()
    .default('default'),
  isFavorite: z.boolean().optional().default(false),
  isPinned: z.boolean().optional().default(false),
  isArchived: z.boolean().optional().default(false),
});

export const updateNoteSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  color: z
    .enum(['default', 'rose', 'amber', 'emerald', 'sky', 'indigo', 'violet'])
    .optional(),
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const getNotesQuerySchema = z.object({
  search: z.string().optional(),
  tag: z.string().optional(),
  color: z
    .enum(['default', 'rose', 'amber', 'emerald', 'sky', 'indigo', 'violet'])
    .optional(),
  isFavorite: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  isPinned: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  isArchived: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  isDeleted: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  sort: z
    .enum([
      'updated_desc',
      'updated_asc',
      'created_desc',
      'created_asc',
      'title_asc',
      'title_desc',
      'order_asc',
    ])
    .optional()
    .default('updated_desc'),
  page: z
    .string()
    .default('1')
    .transform((val) => Math.max(1, parseInt(val, 10) || 1)),
  limit: z
    .string()
    .default('50')
    .transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 50))),
});
