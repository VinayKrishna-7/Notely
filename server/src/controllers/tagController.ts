import { Response, NextFunction } from 'express';
import { Tag } from '../models/Tag';
import { Note } from '../models/Note';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';

export const tagController = {
  // GET /api/tags
  async getTags(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      // Fetch user tags
      const tags = await Tag.find({ user: req.user._id }).sort({ name: 1 });

      // Aggregate note counts for each tag
      const noteCountAggregation = await Note.aggregate([
        { $match: { user: req.user._id, isDeleted: false } },
        { $unwind: '$tags' },
        { $group: { _id: { $toLower: '$tags' }, count: { $sum: 1 } } },
      ]);

      const countMap = new Map<string, number>();
      const allTagNames = new Set(tags.map((t) => t.name.toLowerCase()));
      const missingTags: string[] = [];

      noteCountAggregation.forEach((item) => {
        const tagName = String(item._id).trim().toLowerCase();
        if (tagName) {
          countMap.set(tagName, item.count);
          if (!allTagNames.has(tagName)) {
            missingTags.push(tagName);
          }
        }
      });

      // Auto-persist any tags from notes that aren't yet in Tag collection
      if (missingTags.length > 0) {
        const createdMissing = await Promise.all(
          missingTags.map((name) =>
            Tag.findOneAndUpdate(
              { user: req.user!._id, name },
              { user: req.user!._id, name },
              { upsert: true, returnDocument: 'after' }
            )
          )
        );
        for (const created of createdMissing) {
          if (created) tags.push(created);
        }
      }

      // Sort tags alphabetically
      tags.sort((a, b) => a.name.localeCompare(b.name));

      const tagsWithCounts = tags.map((t) => ({
        _id: t._id,
        name: t.name,
        color: t.color,
        noteCount: countMap.get(t.name.toLowerCase()) || 0,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));

      return sendSuccess(res, tagsWithCounts, 200);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/tags
  async createTag(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const { name, color = '' } = req.body;
      const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-');

      if (!cleanName) {
        throw new AppError('Tag name cannot be empty', 400);
      }

      const existing = await Tag.findOne({ user: req.user._id, name: cleanName });
      if (existing) {
        const noteCount = await Note.countDocuments({
          user: req.user._id,
          tags: cleanName,
          isDeleted: false,
        });
        return sendSuccess(res, { ...existing.toJSON(), noteCount }, 200, 'Tag already exists');
      }

      const tag = await Tag.create({
        user: req.user._id,
        name: cleanName,
        color,
      });

      return sendSuccess(res, { ...tag.toJSON(), noteCount: 0 }, 201, 'Tag created');
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/tags/:id
  async updateTag(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const { name, color } = req.body;
      const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-');

      const tag = await Tag.findOne({ _id: req.params.id, user: req.user._id });
      if (!tag) throw new AppError('Tag not found', 404);

      const oldName = tag.name;
      tag.name = cleanName;
      if (color !== undefined) tag.color = color;
      await tag.save();

      // Rename tag across all user's notes
      if (oldName !== cleanName) {
        await Note.updateMany(
          { user: req.user._id, tags: oldName },
          { $set: { 'tags.$[elem]': cleanName } },
          { arrayFilters: [{ elem: oldName }] }
        );
      }

      const noteCount = await Note.countDocuments({
        user: req.user._id,
        tags: cleanName,
        isDeleted: false,
      });

      return sendSuccess(res, { ...tag.toJSON(), noteCount }, 200, 'Tag updated');
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/tags/:id
  async deleteTag(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const tag = await Tag.findOneAndDelete({ _id: req.params.id, user: req.user._id });
      if (!tag) throw new AppError('Tag not found', 404);

      // Remove tag from all user's notes
      await Note.updateMany(
        { user: req.user._id, tags: tag.name },
        { $pull: { tags: tag.name } }
      );

      return sendSuccess(res, null, 200, 'Tag deleted');
    } catch (error) {
      next(error);
    }
  },
};
