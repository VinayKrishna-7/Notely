import { Response, NextFunction } from 'express';
import { Note } from '../models/Note';
import { Tag } from '../models/Tag';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';
import { snapshotNoteVersion } from './versionController';

// Helper to sync new tags into Tag collection
async function syncTags(userId: any, tags: string[]) {
  if (!tags || tags.length === 0) return;
  const promises = tags.map(async (tagName) => {
    const clean = tagName.trim().toLowerCase().replace(/\s+/g, '-');
    if (!clean) return;
    try {
      await Tag.findOneAndUpdate(
        { user: userId, name: clean },
        { user: userId, name: clean },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (err) {
      // Ignore unique constraint race conditions
    }
  });
  await Promise.all(promises);
}

export const noteController = {
  // GET /api/notes
  async getNotes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const {
        search,
        tag,
        color,
        isFavorite,
        isPinned,
        isArchived,
        isDeleted,
        sort = 'updated_desc',
        page = '1',
        limit = '50',
      } = req.query as any;

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
      const skip = (pageNum - 1) * limitNum;

      // Base query: scoped strictly to authenticated user
      const query: any = { user: req.user._id };

      // Handle Deleted filter
      if (isDeleted !== undefined) {
        query.isDeleted = isDeleted === true || isDeleted === 'true';
      } else {
        // By default, do NOT return soft-deleted notes
        query.isDeleted = false;
      }

      // Handle Archived filter
      if (isArchived !== undefined) {
        query.isArchived = isArchived === true || isArchived === 'true';
      } else if (!query.isDeleted) {
        // By default, exclude archived notes from general queries unless requested
        query.isArchived = false;
      }

      // Handle Favorite filter
      if (isFavorite !== undefined) {
        query.isFavorite = isFavorite === true || isFavorite === 'true';
      }

      // Handle Pinned filter
      if (isPinned !== undefined) {
        query.isPinned = isPinned === true || isPinned === 'true';
      }

      // Handle Tag filter
      if (tag && typeof tag === 'string' && tag.trim()) {
        const cleanTag = tag.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.tags = { $regex: new RegExp(`^${cleanTag}$`, 'i') };
      }

      // Handle Color filter
      if (color) {
        query.color = color;
      }

      // Parse advanced search tokens (e.g. tag:react, is:pinned, created:today)
      let textQuery = '';
      if (search && typeof search === 'string' && search.trim()) {
        const parts = search.trim().split(/\s+/);
        const textTokens: string[] = [];

        for (const part of parts) {
          const lower = part.toLowerCase();
          if (lower.startsWith('tag:')) {
            const tagVal = part.slice(4).trim();
            if (tagVal) {
              const cleanTag = tagVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              query.tags = { $regex: new RegExp(`^${cleanTag}$`, 'i') };
            }
          } else if (lower === 'is:favorite' || lower === 'is:starred') {
            query.isFavorite = true;
          } else if (lower === 'is:pinned') {
            query.isPinned = true;
          } else if (lower === 'is:archived') {
            query.isArchived = true;
          } else if (lower === 'is:deleted' || lower === 'is:trash') {
            query.isDeleted = true;
          } else if (lower === 'created:today') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            query.createdAt = { $gte: startOfDay };
          } else if (lower === 'created:week') {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            query.createdAt = { $gte: weekAgo };
          } else if (lower === 'updated:today') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            query.updatedAt = { $gte: startOfDay };
          } else if (lower === 'updated:week') {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            query.updatedAt = { $gte: weekAgo };
          } else if (part.trim()) {
            textTokens.push(part);
          }
        }
        textQuery = textTokens.join(' ');
      }

      // Handle Text Query (title, content, or tags)
      if (textQuery.trim()) {
        const searchRegex = new RegExp(textQuery.trim(), 'i');
        query.$or = [
          { title: searchRegex },
          { content: searchRegex },
          { tags: searchRegex },
        ];
      }

      // Sort mapping
      let sortConfig: any = { isPinned: -1, updatedAt: -1 };
      if (sort === 'updated_asc') sortConfig = { updatedAt: 1 };
      else if (sort === 'created_desc') sortConfig = { createdAt: -1 };
      else if (sort === 'created_asc') sortConfig = { createdAt: 1 };
      else if (sort === 'title_asc') sortConfig = { title: 1 };
      else if (sort === 'title_desc') sortConfig = { title: -1 };
      else if (sort === 'order_asc') sortConfig = { sortOrder: 1, updatedAt: -1 };

      let notes = await Note.find(query).sort(sortConfig).skip(skip).limit(limitNum);
      const total = await Note.countDocuments(query);

      // Smart Ranking when text query is present:
      // 1. Exact title match -> 2. Title partial/starts-with -> 3. Tag match -> 4. Content match
      if (textQuery.trim()) {
        const term = textQuery.trim().toLowerCase();
        notes = [...notes].sort((a, b) => {
          const aTitle = (a.title || '').toLowerCase();
          const bTitle = (b.title || '').toLowerCase();
          const aExact = aTitle === term ? 100 : aTitle.startsWith(term) ? 50 : aTitle.includes(term) ? 30 : 0;
          const bExact = bTitle === term ? 100 : bTitle.startsWith(term) ? 50 : bTitle.includes(term) ? 30 : 0;
          const aTag = a.tags.some((t) => t.toLowerCase() === term) ? 20 : 0;
          const bTag = b.tags.some((t) => t.toLowerCase() === term) ? 20 : 0;
          const scoreA = aExact + aTag;
          const scoreB = bExact + bTag;
          return scoreB - scoreA;
        });
      }

      return sendSuccess(res, notes, 200, undefined, {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/notes/:id
  async getNoteById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const note = await Note.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!note) {
        throw new AppError('Note not found', 404);
      }

      return sendSuccess(res, note, 200);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/notes
  async createNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const {
        title = '',
        content = '',
        tags = [],
        color = 'default',
        isFavorite = false,
        isPinned = false,
        isArchived = false,
      } = req.body;

      const cleanedTags = (tags as string[]).map((t) =>
        t.trim().toLowerCase().replace(/\s+/g, '-')
      ).filter(Boolean);

      const note = await Note.create({
        user: req.user._id,
        title,
        content,
        tags: cleanedTags,
        color,
        isFavorite,
        isPinned,
        isArchived,
      });

      // Background sync tags
      await syncTags(req.user._id, cleanedTags);

      // Snapshot initial version
      if (title || content) {
        await snapshotNoteVersion(req.user._id, note, 'Initial version');
      }

      return sendSuccess(res, note, 201, 'Note created successfully');
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/notes/:id
  async updateNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const note = await Note.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!note) {
        throw new AppError('Note not found', 404);
      }

      const {
        title,
        content,
        tags,
        color,
        isFavorite,
        isPinned,
        isArchived,
      } = req.body;

      if (title !== undefined) note.title = title;
      if (content !== undefined) note.content = content;
      if (color !== undefined) note.color = color;
      if (isFavorite !== undefined) note.isFavorite = isFavorite;
      if (isPinned !== undefined) note.isPinned = isPinned;
      if (isArchived !== undefined) note.isArchived = isArchived;

      if (tags !== undefined) {
        const cleanedTags = (tags as string[]).map((t) =>
          t.trim().toLowerCase().replace(/\s+/g, '-')
        ).filter(Boolean);
        note.tags = cleanedTags;
        await syncTags(req.user._id, cleanedTags);
      }

      await note.save();

      // Snapshot version on significant note updates
      if (title !== undefined || content !== undefined) {
        await snapshotNoteVersion(req.user._id, note, 'Updated note content/title');
      }

      return sendSuccess(res, note, 200, 'Note updated successfully');
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/notes/:id (Soft delete -> Trash)
  async deleteNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const note = await Note.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { isDeleted: true, deletedAt: new Date() },
        { returnDocument: 'after' }
      );

      if (!note) {
        throw new AppError('Note not found', 404);
      }

      return sendSuccess(res, note, 200, 'Note moved to trash');
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/notes/:id/favorite
  async toggleFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const note = await Note.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!note) throw new AppError('Note not found', 404);

      note.isFavorite = !note.isFavorite;
      await note.save();

      return sendSuccess(res, note, 200);
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/notes/:id/pin
  async togglePin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const note = await Note.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!note) throw new AppError('Note not found', 404);

      note.isPinned = !note.isPinned;
      await note.save();

      return sendSuccess(res, note, 200);
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/notes/:id/archive
  async toggleArchive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const note = await Note.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!note) throw new AppError('Note not found', 404);

      note.isArchived = !note.isArchived;
      await note.save();

      return sendSuccess(res, note, 200);
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/notes/:id/restore
  async restoreNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const note = await Note.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { isDeleted: false, deletedAt: null },
        { returnDocument: 'after' }
      );

      if (!note) throw new AppError('Note not found', 404);

      return sendSuccess(res, note, 200, 'Note restored');
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/notes/:id/permanent
  async permanentDelete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const note = await Note.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!note) throw new AppError('Note not found', 404);

      return sendSuccess(res, null, 200, 'Note permanently deleted');
    } catch (error) {
      next(error);
    }
  },

  // POST /api/notes/:id/duplicate
  async duplicateNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const original = await Note.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!original) throw new AppError('Note not found', 404);

      const duplicated = await Note.create({
        user: req.user._id,
        title: original.title ? `${original.title} (Copy)` : 'Untitled Note (Copy)',
        content: original.content,
        tags: [...original.tags],
        color: original.color,
        isFavorite: false,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      return sendSuccess(res, duplicated, 201, 'Note duplicated');
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/notes/reorder
  async reorderNotes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const { orderedIds, items } = req.body;

      let updates: Array<{ id: string; sortOrder: number }> = [];

      if (Array.isArray(items)) {
        updates = items;
      } else if (Array.isArray(orderedIds)) {
        updates = orderedIds.map((id: string, index: number) => ({
          id,
          sortOrder: index,
        }));
      } else {
        throw new AppError('Invalid payload. Expected orderedIds or items array', 400);
      }

      if (updates.length > 0) {
        const bulkOps = updates.map(({ id, sortOrder }) => ({
          updateOne: {
            filter: { _id: id, user: req.user!._id },
            update: { $set: { sortOrder } },
          },
        }));

        await Note.bulkWrite(bulkOps);
      }

      return sendSuccess(res, { updatedCount: updates.length }, 200, 'Notes reordered successfully');
    } catch (error) {
      next(error);
    }
  },
};
