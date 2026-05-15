import express from 'express';
import { updateMilestone, getMilestone } from '../controllers/milestoneController.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.get('/:id', getMilestone);
router.put('/:id', updateMilestone);

export default router;
