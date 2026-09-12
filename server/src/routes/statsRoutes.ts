import { Router } from 'express';
import { statsController } from '../controllers/statsController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', statsController.getStats);

export const statsRoutes = router;
