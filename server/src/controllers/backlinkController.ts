import { Response, NextFunction } from 'express';
import { Note } from '../models/Note';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';

export const backlinkController = {
  // GET /api/notes/:id/backlinks
  async getNoteBacklinks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const targetNote = await Note.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!targetNote) {
        throw new AppError('Note not found', 404);
      }

      if (!targetNote.title || !targetNote.title.trim()) {
        return sendSuccess(res, [], 200);
      }

      const cleanTitle = targetNote.title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Look for [[Title]] in content
      const regex = new RegExp(`\\[\\[${cleanTitle}\\]\\]`, 'i');

      const referencingNotes = await Note.find({
        user: req.user._id,
        _id: { $ne: targetNote._id },
        isDeleted: false,
        content: { $regex: regex },
      }).select('_id title content updatedAt color tags');

      // Map to snippet items
      const backlinks = referencingNotes.map((n) => {
        const lowerContent = n.content.toLowerCase();
        const searchTarget = `[[${targetNote.title.toLowerCase()}]]`;
        const idx = lowerContent.indexOf(searchTarget);
        let snippet = '';

        if (idx !== -1) {
          const start = Math.max(0, idx - 30);
          const end = Math.min(n.content.length, idx + searchTarget.length + 30);
          snippet = (start > 0 ? '...' : '') + n.content.substring(start, end).trim() + (end < n.content.length ? '...' : '');
        } else {
          snippet = n.content.substring(0, 70);
        }

        return {
          _id: n._id,
          title: n.title || 'Untitled Note',
          snippet,
          color: n.color,
          tags: n.tags,
          updatedAt: n.updatedAt,
        };
      });

      return sendSuccess(res, backlinks, 200);
    } catch (error) {
      next(error);
    }
  },
};
