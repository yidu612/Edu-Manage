import express from 'express';
import { aiCheck } from '../controllers/aiController.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);
router.post('/check', aiCheck);

export default router;
