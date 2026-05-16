import express from 'express';
import {
  getDiscussions,
  createDiscussion,
  addReply,
  deleteDiscussion,
} from '../controllers/discussionController.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

router.get('/',     getDiscussions);
router.post('/',    createDiscussion);
router.post('/:id/replies', addReply);
router.delete('/:id', deleteDiscussion);

export default router;
