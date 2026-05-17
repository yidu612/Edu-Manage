import Project from '../models/Project.js';
import User from '../models/user.model.js';
import Repository from '../models/Repository.js';
import DefenseSession from '../models/DefenseSession.js';
import Proposal from '../models/Proposal.js';
import { notify } from '../utils/notify.js';
import mongoose from 'mongoose';
import { ROLES } from '../config/roles.js';

export const getPendingTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: ROLES.TEACHER, approvalStatus: 'pending' })
      .select('fullName email department createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: teachers });
  } catch (err) {
    console.error('getPendingTeachers error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveTeacher = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: ROLES.TEACHER, approvalStatus: 'pending' },
      { approvalStatus: 'approved' },
      { new: true }
    ).select('fullName email department approvalStatus');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Pending teacher not found' });
    }

    await notify({
      recipientId:      user._id,
      notificationType: 'system',
      message:          'Your teacher account has been approved. You can now log in.',
      priority:         'high',
    });

    res.json({ success: true, message: 'Teacher approved', data: user });
  } catch (err) {
    console.error('approveTeacher error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const rejectTeacher = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: ROLES.TEACHER, approvalStatus: 'pending' },
      { approvalStatus: 'rejected' },
      { new: true }
    ).select('fullName email approvalStatus');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Pending teacher not found' });
    }

    res.json({ success: true, message: 'Teacher registration rejected', data: user });
  } catch (err) {
    console.error('rejectTeacher error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProjects,
      totalProposals,
      projectsByStatus,
      submissionsPerMonth,
      usersByRole,
      avgSimilarityRaw,
    ] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Proposal.countDocuments(),
      Project.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Project.aggregate([
        { $match: { submissionDate: { $ne: null } } },
        {
          $group: {
            _id:   { month: { $month: '$submissionDate' }, year: { $year: '$submissionDate' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Project.aggregate([
        { $match: { similarityScore: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$similarityScore' } } },
      ]),
    ]);

    const avgSimilarity = avgSimilarityRaw[0]?.avg ?? 0;

    res.json({
      success: true,
      data: {
        totals: { users: totalUsers, projects: totalProjects, proposals: totalProposals },
        projectsByStatus,
        submissionsPerMonth,
        usersByRole,
        avgSimilarityScore: Math.round(avgSimilarity * 10) / 10,
      },
    });
  } catch (err) {
    console.error('getAnalytics error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Defense Sessions ─────────────────────────────────────────────────────────

export const createDefenseSession = async (req, res) => {
  try {
    const { projectId, scheduledAt, location, examiners } = req.body;
    if (!projectId || !scheduledAt) {
      return res.status(400).json({ success: false, message: 'projectId and scheduledAt are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid projectId' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const examinerIds = (examiners ?? []).filter((id) => mongoose.Types.ObjectId.isValid(id));

    const session = await DefenseSession.create({
      projectId,
      scheduledAt: new Date(scheduledAt),
      location,
      examiners: examinerIds,
    });

    const populated = await DefenseSession.findById(session._id)
      .populate('projectId', 'title abstract studentId')
      .populate('examiners', 'fullName email');

    // Notify assigned examiners
    for (const examId of examinerIds) {
      await notify({
        recipientId:      examId,
        notificationType: 'system',
        message:          `You have been assigned to examine "${project.title}" on ${new Date(scheduledAt).toLocaleDateString()}.`,
        priority:         'high',
      });
    }

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('createDefenseSession error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAllDefenseSessions = async (req, res) => {
  try {
    const sessions = await DefenseSession.find()
      .populate('projectId', 'title abstract studentId')
      .populate('examiners', 'fullName email')
      .sort({ scheduledAt: -1 });
    res.json({ success: true, data: sessions });
  } catch (err) {
    console.error('getAllDefenseSessions error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const finalizeDefenseSession = async (req, res) => {
  try {
    const session = await DefenseSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Session already finalized' });
    }
    if (session.scores.length === 0) {
      return res.status(400).json({ success: false, message: 'No scores submitted yet' });
    }

    const avg = session.scores.reduce((sum, s) => sum + s.score, 0) / session.scores.length;
    session.finalScore = Math.round(avg * 10) / 10;
    session.status = 'completed';
    await session.save();

    const populated = await DefenseSession.findById(session._id)
      .populate('projectId', 'title abstract studentId')
      .populate('examiners', 'fullName email');

    res.json({ success: true, data: populated });
  } catch (err) {
    console.error('finalizeDefenseSession error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Publish / Visibility ─────────────────────────────────────────────────────

export const publishProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Only approved projects can be published' });
    }

    let repo = await Repository.findOne({ projectId: project._id });
    if (!repo) {
      repo = await Repository.create({ projectId: project._id, visibility: 'public' });
    } else {
      repo.visibility = 'public';
      await repo.save();
    }

    if (!project.repositoryId) {
      project.repositoryId = repo._id;
      await project.save();
    }

    res.json({ success: true, message: 'Project published', data: repo });
  } catch (err) {
    console.error('publishProject error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const unpublishProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const repo = await Repository.findOne({ projectId: project._id });
    if (!repo) return res.status(404).json({ success: false, message: 'Repository not found' });

    repo.visibility = 'private';
    await repo.save();

    res.json({ success: true, message: 'Project unpublished', data: repo });
  } catch (err) {
    console.error('unpublishProject error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Mentor Assignment ────────────────────────────────────────────────────────

export const assignMentor = async (req, res) => {
  try {
    const { projectId, mentorId } = req.body;
    if (!projectId || !mentorId) {
      return res.status(400).json({ success: false, message: 'projectId and mentorId are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({ success: false, message: 'Invalid projectId or mentorId' });
    }

    const mentor = await User.findOne({ _id: mentorId, role: ROLES.TEACHER });
    if (!mentor) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const project = await Project.findByIdAndUpdate(
      projectId,
      { mentorId },
      { new: true }
    )
      .populate('studentId', 'fullName email')
      .populate('mentorId',  'fullName email');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    await notify({
      recipientId:      project.studentId._id,
      notificationType: 'system',
      message:          `${mentor.fullName} has been assigned as your project mentor.`,
      priority:         'high',
    });
    await notify({
      recipientId:      mentorId,
      notificationType: 'system',
      message:          `You have been assigned as mentor for "${project.title}".`,
      priority:         'high',
    });

    res.json({ success: true, message: 'Mentor assigned successfully', data: project });
  } catch (err) {
    console.error('assignMentor error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};
