import Project from '../models/Project.js';
import Milestone from '../models/Milestone.js';
import { notify } from '../utils/notify.js';
import mongoose from 'mongoose';

// ─── Projects ─────────────────────────────────────────────────────────────────

export const getProjects = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') filter.studentId = req.user._id;
    else if (req.user.role === 'teacher') filter.mentorId = req.user._id;

    const projects = await Project.find(filter)
      .populate('studentId', 'fullName email department')
      .populate('mentorId',  'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('studentId', 'fullName email department')
      .populate('mentorId',  'fullName email')
      .populate('repositoryId');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, objectives, abstract, mentorId } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    if (mentorId && !mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({ success: false, message: 'Invalid mentorId' });
    }

    const project = new Project({
      title,
      studentId: req.user._id,
      mentorId:  mentorId || undefined,
      objectives,
      abstract,
      status: 'draft',
    });

    const saved = await project.save();
    const populated = await Project.findById(saved._id)
      .populate('studentId', 'fullName email')
      .populate('mentorId',  'fullName email');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('createProject error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (req.user.role === 'student' &&
        project.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const allowed = ['title', 'objectives', 'abstract', 'status', 'progressPercentage'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.status === 'submitted' && project.status !== 'submitted') {
      updates.submissionDate = new Date();
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('studentId', 'fullName email')
      .populate('mentorId',  'fullName email');

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Milestones (nested under /api/projects/:id/milestones) ──────────────────

export const getProjectMilestones = async (req, res) => {
  try {
    const milestones = await Milestone.find({ projectId: req.params.id })
      .sort({ deadline: 1 });
    res.json({ success: true, data: milestones });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createMilestone = async (req, res) => {
  try {
    const { name, description, deadline } = req.body;
    if (!name || !deadline) {
      return res.status(400).json({ success: false, message: 'name and deadline are required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const milestone = await Milestone.create({
      projectId:   req.params.id,
      name,
      description,
      deadline:    new Date(deadline),
    });

    await notify({
      recipientId:      project.studentId,
      notificationType: 'milestone',
      message:          `New milestone "${name}" was added to your project.`,
      priority:         'medium',
    });

    res.status(201).json({ success: true, data: milestone });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Legacy stubs kept so old routes don't crash ─────────────────────────────

export const updateProjectStatus = async (req, res) => {
  const { status, reviewedByTeacherId } = req.body;
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status, ...(reviewedByTeacherId && { mentorId: reviewedByTeacherId }) },
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
