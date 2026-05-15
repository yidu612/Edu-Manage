import express from 'express';
import { assignMentor } from '../controllers/adminController.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.post('/assign-mentor', assignMentor);

export default router;
