import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  getProjectMilestones,
  createMilestone,
  updateProjectStatus,
} from '../controllers/projectController.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.put('/:id/status', updateProjectStatus);
router.get('/:id/milestones', getProjectMilestones);
router.post('/:id/milestones', createMilestone);

export default router;
