import express from 'express';
import {
  getProjectsByDepartment,
  getTeamsByDepartment,
  assignMentorInDepartment,
} from '../controllers/coordinatorController.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import checkRole from '../middleware/roleCheck.js';
import { ROLES } from '../config/roles.js';

const router = express.Router();

router.use(protectRoute);
router.use(checkRole([ROLES.COORDINATOR]));

router.get('/projects',       getProjectsByDepartment);
router.get('/teams',          getTeamsByDepartment);
router.post('/assign-mentor', assignMentorInDepartment);

export default router;
