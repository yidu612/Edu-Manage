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
import {
  getDocumentation,
  getDocumentationHistory,
  addDocumentation,
  deleteDocumentation,
  updateDocumentationStatus,
  saveProjectLinks,
  uploadDocFile,
} from '../controllers/documentationController.js';
import { getReviews, upsertReview } from '../controllers/reviewController.js';
import { protectRoute, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Project CRUD (all require auth)
router.use(protectRoute);

router.get('/',     getProjects);
router.post('/',    createProject);
router.get('/:id',  getProject);
router.put('/:id',  updateProject);
router.put('/:id/status', updateProjectStatus);

// Milestones
router.get('/:id/milestones',  getProjectMilestones);
router.post('/:id/milestones', createMilestone);

// Documentation
router.get('/:id/documentation',                      getDocumentation);
router.get('/:id/documentation/history',              getDocumentationHistory);
router.post('/:id/documentation', uploadDocFile,      addDocumentation);
router.delete('/:id/documentation/:docId',            deleteDocumentation);
router.put('/:id/documentation/:docId/status',        updateDocumentationStatus);
router.put('/:id/links',                              saveProjectLinks);

// Reviews (read is also available on public routes; post requires auth via router.use above)
router.get('/:id/reviews',  getReviews);
router.post('/:id/reviews', upsertReview);

export default router;
