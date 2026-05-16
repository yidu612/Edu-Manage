import Review from '../models/Review.js';
import Project from '../models/Project.js';

// GET /api/projects/:id/reviews — public
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ projectId: req.params.id })
      .populate('userId', 'fullName imageUrl')
      .sort({ createdAt: -1 });

    // Normalise userId → user for frontend compatibility
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
};

// POST /api/projects/:id/reviews — auth required, upserts (one per user per project)
export const upsertReview = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, status: 'approved' });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found or not public' });

    const { rate, comment } = req.body;
    if (!rate || rate < 1 || rate > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1–5' });
    }

    const review = await Review.findOneAndUpdate(
      { projectId: req.params.id, userId: req.user._id },
      { rating: rate, comment: comment || '' },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
