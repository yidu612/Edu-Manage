import Discussion from '../models/Discussion.js';
import Project from '../models/Project.js';

// GET /api/discussions — returns discussions relevant to the authenticated user
export const getDiscussions = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'student') {
      // Show discussions for the student's own projects + any general discussions
      const projects = await Project.find({ studentId: req.user._id }).select('_id');
      const ids = projects.map((p) => p._id);
      filter = { $or: [{ projectId: { $in: ids } }, { projectId: null }] };
    } else if (req.user.role === 'teacher') {
      const projects = await Project.find({ mentorId: req.user._id }).select('_id');
      const ids = projects.map((p) => p._id);
      filter = { $or: [{ projectId: { $in: ids } }, { projectId: null }] };
    }
    // admin sees all — filter stays {}

    const discussions = await Discussion.find(filter)
      .populate('author', 'fullName imageUrl role')
      .populate('replies.author', 'fullName imageUrl role')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: discussions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/discussions
export const createDiscussion = async (req, res) => {
  try {
    const { title, content, projectId } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      // Students can only post to their own projects
      if (
        req.user.role === 'student' &&
        project.studentId.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    const discussion = await Discussion.create({
      author: req.user._id,
      title,
      content,
      projectId: projectId || undefined,
    });

    const populated = await Discussion.findById(discussion._id)
      .populate('author', 'fullName imageUrl role')
      .populate('projectId', 'title');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/discussions/:id/replies
export const addReply = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    discussion.replies.push({ author: req.user._id, content });
    await discussion.save();

    const populated = await Discussion.findById(discussion._id)
      .populate('author', 'fullName imageUrl role')
      .populate('replies.author', 'fullName imageUrl role')
      .populate('projectId', 'title');

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/discussions/:id
export const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    if (
      req.user.role !== 'admin' &&
      discussion.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await discussion.deleteOne();
    res.json({ success: true, message: 'Discussion deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
