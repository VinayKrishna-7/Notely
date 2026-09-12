import { Response, NextFunction } from 'express';
import { Note } from '../models/Note';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';

// Formatter helper for daily note title & header
function getDailyDateDetails(dateStr?: string) {
  let dateObj: Date;
  let isoDate: string;

  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)); // UTC midday to prevent timezone shift
    isoDate = dateStr;
  } else {
    dateObj = new Date();
    isoDate = dateObj.toISOString().split('T')[0];
  }

  const title = dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });

  return { isoDate, title, weekday };
}

export const dailyNoteController = {
  // GET /api/notes/daily/:date?
  async getOrCreateDailyNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const rawDate = typeof req.params.date === 'string' ? req.params.date : undefined;
      const { isoDate, title, weekday } = getDailyDateDetails(rawDate);

      // 1. Search for existing daily note for this date
      let dailyNote = await Note.findOne({
        user: req.user._id,
        isDaily: true,
        dailyDate: isoDate,
        isDeleted: false,
      });

      if (dailyNote) {
        return sendSuccess(res, dailyNote, 200);
      }

      // 2. Deterministic default template
      const defaultContent = `# ${weekday}, ${title}

## 🎯 Focus & Priorities
- [ ] 

## 💭 Thoughts & Brainstorming


## 📝 Quick Notes & Log
`;

      dailyNote = await Note.create({
        user: req.user._id,
        title,
        content: defaultContent,
        tags: ['daily'],
        color: 'default',
        isDaily: true,
        dailyDate: isoDate,
        isFavorite: false,
        isPinned: false,
        isArchived: false,
      });

      return sendSuccess(res, dailyNote, 201, 'Daily note initialized');
    } catch (error) {
      next(error);
    }
  },

  // GET /api/notes/daily-dates
  async getDailyNoteDates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const dailyNotes = await Note.find({
        user: req.user._id,
        isDaily: true,
        isDeleted: false,
      }).select('dailyDate title updatedAt');

      const dates = dailyNotes.map((n) => ({
        date: n.dailyDate,
        title: n.title,
        noteId: n._id,
      }));

      return sendSuccess(res, dates, 200);
    } catch (error) {
      next(error);
    }
  },
};
