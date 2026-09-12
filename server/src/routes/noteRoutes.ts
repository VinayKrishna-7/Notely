import { Router } from 'express';
import { noteController } from '../controllers/noteController';
import { versionController } from '../controllers/versionController';
import { backlinkController } from '../controllers/backlinkController';
import { dailyNoteController } from '../controllers/dailyNoteController';
import { protect } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createNoteSchema,
  updateNoteSchema,
  getNotesQuerySchema,
} from '../validators/noteValidator';

const router = Router();

// Protect all note routes
router.use(protect);

// Daily notes endpoints
router.get('/daily-dates', dailyNoteController.getDailyNoteDates);
router.get('/daily', dailyNoteController.getOrCreateDailyNote);
router.get('/daily/:date', dailyNoteController.getOrCreateDailyNote);

router.get('/', validateQuery(getNotesQuerySchema), noteController.getNotes);
router.post('/', validateBody(createNoteSchema), noteController.createNote);
router.patch('/reorder', noteController.reorderNotes);
router.get('/:id', noteController.getNoteById);
router.put('/:id', validateBody(updateNoteSchema), noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

router.patch('/:id/favorite', noteController.toggleFavorite);
router.patch('/:id/pin', noteController.togglePin);
router.patch('/:id/archive', noteController.toggleArchive);
router.patch('/:id/restore', noteController.restoreNote);
router.delete('/:id/permanent', noteController.permanentDelete);
router.post('/:id/duplicate', noteController.duplicateNote);

// Version history endpoints
router.get('/:id/versions', versionController.getNoteVersions);
router.get('/:id/versions/:versionId', versionController.getVersionById);
router.post('/:id/versions/:versionId/restore', versionController.restoreVersion);

// Backlinks endpoint
router.get('/:id/backlinks', backlinkController.getNoteBacklinks);

export const noteRoutes = router;
