import { Router } from 'express';
import { tagController } from '../controllers/tagController';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createTagSchema, updateTagSchema } from '../validators/tagValidator';

const router = Router();

router.use(protect);

router.get('/', tagController.getTags);
router.post('/', validateBody(createTagSchema), tagController.createTag);
router.put('/:id', validateBody(updateTagSchema), tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

export const tagRoutes = router;
