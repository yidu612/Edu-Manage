import express from 'express';
import {
  assignMentor,
  getPendingTeachers,
  approveTeacher,
  rejectTeacher,
  createDefenseSession,
  getAllDefenseSessions,
  finalizeDefenseSession,
  publishProject,
  unpublishProject,
} from '../controllers/adminController.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import checkRole from '../middleware/roleCheck.js';
import { ROLES } from '../config/roles.js';

const router = express.Router();

router.use(protectRoute);
router.use(checkRole([ROLES.ADMIN]));

router.post('/assign-mentor',                       assignMentor);
router.get('/pending-teachers',                     getPendingTeachers);
router.post('/approve-teacher/:id',                 approveTeacher);
router.post('/reject-teacher/:id',                  rejectTeacher);

router.post('/defense-sessions',                    createDefenseSession);
router.get('/defense-sessions',                     getAllDefenseSessions);
router.patch('/defense-sessions/:id/finalize',      finalizeDefenseSession);

router.patch('/projects/:id/publish',               publishProject);
router.patch('/projects/:id/unpublish',             unpublishProject);

export default router;
