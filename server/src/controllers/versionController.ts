import { Response, NextFunction } from 'express';
import { Note } from '../models/Note';
import { NoteVersion } from '../models/NoteVersion';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';

export async function snapshotNoteVersion(
  userId: any,
  note: any,
  changeSummary: string = 'Note updated',
  forceNew: boolean = false
) {
  try {
    // Check if there is a recent version with identical content
    const lastVersion = await NoteVersion.findOne({
      note: note._id,
      user: userId,
    }).sort({ createdAt: -1 });

    if (
      lastVersion &&
      lastVersion.title === note.title &&
      lastVersion.content === note.content &&
      lastVersion.color === note.color &&
      JSON.stringify(lastVersion.tags) === JSON.stringify(note.tags)
    ) {
      return; // Skip duplicate version
    }

    // If last version was created less than 45 seconds ago and not forcing a new version, update last version
    const now = Date.now();
    if (
      !forceNew &&
      process.env.NODE_ENV !== 'test' &&
      lastVersion &&
      now - new Date(lastVersion.createdAt).getTime() < 45000
    ) {
      lastVersion.title = note.title;
      lastVersion.content = note.content;
      lastVersion.tags = note.tags;
      lastVersion.color = note.color;
      lastVersion.changeSummary = changeSummary;
      await lastVersion.save();
      return;
    }

    await NoteVersion.create({
      note: note._id,
      user: userId,
      title: note.title,
      content: note.content,
      tags: note.tags,
      color: note.color,
      changeSummary,
    });
  } catch (err) {
    // Log silently, do not break the main note mutation
    console.error('[Version Snapshot Error]:', err);
  }
}

export const versionController = {
  // GET /api/notes/:id/versions
  async getNoteVersions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const note = await Note.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!note) {
        throw new AppError('Note not found', 404);
      }

      const versions = await NoteVersion.find({
        note: note._id,
        user: req.user._id,
      }).sort({ createdAt: -1 });

      return sendSuccess(res, versions, 200);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/notes/:id/versions/:versionId
  async getVersionById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const version = await NoteVersion.findOne({
        _id: req.params.versionId,
        note: req.params.id,
        user: req.user._id,
      });

      if (!version) {
        throw new AppError('Version not found', 404);
      }

      return sendSuccess(res, version, 200);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/notes/:id/versions/:versionId/restore
  async restoreVersion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const note = await Note.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!note) {
        throw new AppError('Note not found', 404);
      }

      const targetVersion = await NoteVersion.findOne({
        _id: req.params.versionId,
        note: note._id,
        user: req.user._id,
      });

      if (!targetVersion) {
        throw new AppError('Version to restore not found', 404);
      }

      // Snapshot the current state before restoring so history is never lost
      await NoteVersion.create({
        note: note._id,
        user: req.user._id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        color: note.color,
        changeSummary: 'Snapshot prior to restore',
      });

      // Apply restored attributes
      note.title = targetVersion.title;
      note.content = targetVersion.content;
      note.tags = targetVersion.tags;
      note.color = targetVersion.color;
      await note.save();

      // Create restored version record
      await NoteVersion.create({
        note: note._id,
        user: req.user._id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        color: note.color,
        changeSummary: `Restored version from ${new Date(targetVersion.createdAt).toLocaleDateString()}`,
      });

      return sendSuccess(res, note, 200, 'Version restored successfully');
    } catch (error) {
      next(error);
    }
  },
};
