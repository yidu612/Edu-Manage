import express from 'express';
import Project from '../models/Project.js';
import Repository from '../models/Repository.js';
import Documentation from '../models/Documentation.js';
import Review from '../models/Review.js';

const router = express.Router();

// GET /api/public/projects — published (approved + public repo) projects only, no auth required
router.get('/', async (req, res) => {
  try {
    // Find all public repositories
    const publicRepos = await Repository.find({ visibility: 'public' }).select('projectId');
    const publicProjectIds = publicRepos.map((r) => r.projectId);

    const projects = await Project.find({
      status: 'approved',
      _id: { $in: publicProjectIds },
    })
      .populate('studentId', 'fullName email department')
      .populate('mentorId', 'fullName email')
      .populate('repositoryId')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/public/projects/:id — single published project
router.get('/:id', async (req, res) => {
  try {
    const repo = await Repository.findOne({ projectId: req.params.id, visibility: 'public' });
    if (!repo) return res.status(404).json({ success: false, message: 'Project not found' });

    const project = await Project.findOne({ _id: req.params.id, status: 'approved' })
      .populate('studentId', 'fullName email department')
      .populate('mentorId', 'fullName email')
      .populate('repositoryId');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/public/projects/:id/documentation — approved docs only
router.get('/:id/documentation', async (req, res) => {
  try {
    const docs = await Documentation.find({ projectId: req.params.id, status: 'approved' })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/public/projects/:id/reviews — all reviews, no auth needed
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ projectId: req.params.id })
      .populate('userId', 'fullName imageUrl')
      .sort({ createdAt: -1 });

    const data = reviews.map((r) => ({
      id:         r._id,
      rate:       r.rating,
      comment:    r.comment,
      user_id:    r.userId?._id,
      user:       { name: r.userId?.fullName, imageUrl: r.userId?.imageUrl },
      created_at: r.createdAt,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
