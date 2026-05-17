import express from 'express';
import {
  getMyDefenseSessions,
  submitScore,
} from '../controllers/examinerController.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import checkRole from '../middleware/roleCheck.js';
import { ROLES } from '../config/roles.js';

const router = express.Router();

router.use(protectRoute);
router.use(checkRole([ROLES.EXAMINER]));

router.get('/defense-sessions',          getMyDefenseSessions);
router.post('/defense-sessions/:id/score', submitScore);

export default router;
