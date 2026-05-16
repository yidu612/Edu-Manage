import express from 'express';
import {
  getTeams,
  getMyTeam,
  getTeamById,
  createTeam,
  joinTeamByCode,
  inviteMember,
  leaveTeam,
  removeMember,
} from '../controllers/teamController.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.get('/',          getTeams);
router.get('/my',        getMyTeam);        // must be before /:id
router.post('/',         createTeam);
router.post('/join',     joinTeamByCode);   // must be before /:id
router.get('/:id',       getTeamById);
router.post('/:id/invite', inviteMember);
router.post('/:id/leave',  leaveTeam);
router.delete('/:id/members/:memberId', removeMember);

export default router;
