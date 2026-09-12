import { Response, NextFunction } from 'express';
import { Note } from '../models/Note';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';

export const statsController = {
  // GET /api/stats
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const [
        totalNotes,
        favoritesCount,
        pinnedCount,
        archivedCount,
        trashCount,
        createdThisWeek,
        tagStats,
        recentlyUpdated,
        recentActivityNotes,
      ] = await Promise.all([
        Note.countDocuments({ user: req.user._id, isDeleted: false, isArchived: false }),
        Note.countDocuments({ user: req.user._id, isFavorite: true, isDeleted: false }),
        Note.countDocuments({ user: req.user._id, isPinned: true, isDeleted: false }),
        Note.countDocuments({ user: req.user._id, isArchived: true, isDeleted: false }),
        Note.countDocuments({ user: req.user._id, isDeleted: true }),
        Note.countDocuments({
          user: req.user._id,
          createdAt: { $gte: oneWeekAgo },
          isDeleted: false,
        }),
        Note.aggregate([
          { $match: { user: req.user._id, isDeleted: false } },
          { $unwind: '$tags' },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { name: '$_id', count: 1, _id: 0 } },
        ]),
        Note.find({ user: req.user._id, isDeleted: false, isArchived: false })
          .sort({ updatedAt: -1 })
          .limit(6),
        Note.find(
          { user: req.user._id, isDeleted: false },
          { updatedAt: 1, createdAt: 1, content: 1 }
        ).sort({ updatedAt: -1 }),
      ]);

      // Calculate 7-day activity cadence using UTC dates
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const activityByDay: { day: string; date: string; count: number }[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const count = recentActivityNotes.filter((n) => {
          return new Date(n.updatedAt).toISOString().split('T')[0] === dateStr;
        }).length;

        activityByDay.push({
          day: dayNames[d.getUTCDay()],
          date: dateStr,
          count,
        });
      }

      // Calculate total words
      const totalWords = recentActivityNotes.reduce((acc, note) => {
        const words = (note.content || '').trim().split(/\s+/).filter(Boolean).length;
        return acc + words;
      }, 0);

      // Calculate writing streak (consecutive days with updates)
      const activityDateSet = new Set(
        recentActivityNotes.map((n) => new Date(n.updatedAt).toISOString().split('T')[0])
      );

      let writingStreak = 0;
      const checkDate = new Date();

      const todayStr = checkDate.toISOString().split('T')[0];
      if (!activityDateSet.has(todayStr)) {
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      }

      while (activityDateSet.has(checkDate.toISOString().split('T')[0])) {
        writingStreak++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      }

      return sendSuccess(
        res,
        {
          totalNotes,
          favoritesCount,
          pinnedCount,
          archivedCount,
          trashCount,
          createdThisWeek,
          tagStats,
          recentlyUpdated,
          activityByDay,
          writingStreak,
          totalWords,
        },
        200
      );
    } catch (error) {
      next(error);
    }
  },
};
