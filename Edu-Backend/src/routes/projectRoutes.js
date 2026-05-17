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
import {
  uploadStageFile,
  getProjectStages,
  submitStage,
  advisorReviewStage,
  adminReviewStage,
  getPendingStageReviews,
} from '../controllers/stageController.js';
import { getReviews, upsertReview } from '../controllers/reviewController.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute);

// Stage review queue — must come before /:id to avoid route conflict
router.get('/stages/pending', getPendingStageReviews);

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

// Reviews
router.get('/:id/reviews',  getReviews);
router.post('/:id/reviews', upsertReview);

// Stage progress
router.get('/:id/stages',                                    getProjectStages);
router.post('/:id/stages/:order/submit', uploadStageFile,    submitStage);
router.patch('/:id/stages/:order/advisor-review',            advisorReviewStage);
router.patch('/:id/stages/:order/admin-review',              adminReviewStage);

export default router;
