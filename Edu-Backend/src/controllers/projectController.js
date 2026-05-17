import Project from '../models/Project.js';
import ProjectGroup from '../models/ProjectGroup.js';
import ProjectStageProgress from '../models/ProjectStageProgress.js';
import Proposal from '../models/Proposal.js';
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
      .populate('studentId',  'fullName email department')
      .populate('mentorId',   'fullName email')
      .populate('repositoryId', 'visibility')
      .populate('proposalId', 'title status')
      .populate('groupId', 'name academicYear stages isLocked')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('studentId',  'fullName email department')
      .populate('mentorId',   'fullName email')
      .populate('repositoryId')
      .populate('proposalId', 'title status abstract');

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

    const { category, keywords } = req.body;
    const project = new Project({
      title,
      studentId: req.user._id,
      mentorId:  mentorId || undefined,
      objectives,
      abstract,
      status: 'draft',
      category:  category || undefined,
      keywords:  Array.isArray(keywords) ? keywords : (keywords ? [keywords] : []),
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

    const allowed = ['title', 'objectives', 'abstract', 'status', 'progressPercentage', 'category', 'keywords'];
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

// ─── PATCH /admin/projects/:id/assign-group (admin only) ─────────────────────

export const assignProjectGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    if (!groupId) return res.status(400).json({ success: false, message: 'groupId is required' });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const group = await ProjectGroup.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Project group not found' });
    if (!group.stages || group.stages.length < 2) {
      return res.status(400).json({ success: false, message: 'Project group must have at least 2 stages' });
    }

    // If a different group was already assigned, clean up old stage records
    if (project.groupId && project.groupId.toString() !== groupId) {
      const oldGroup = await ProjectGroup.findById(project.groupId);
      if (oldGroup) {
        await ProjectGroup.findByIdAndUpdate(project.groupId, { $inc: { projectCount: -1 } });
        // Re-evaluate isLocked for old group
        const remaining = await Project.countDocuments({ groupId: project.groupId, _id: { $ne: project._id } });
        if (remaining === 0) await ProjectGroup.findByIdAndUpdate(project.groupId, { isLocked: false });
      }
      await ProjectStageProgress.deleteMany({ projectId: project._id });
    }

    // Only create stages if none exist yet for this group assignment
    const existingStages = await ProjectStageProgress.countDocuments({ projectId: project._id, groupId });
    if (existingStages === 0) {
      const sortedStages = [...group.stages].sort((a, b) => a.order - b.order);

      // Determine stage 1 status from the linked proposal
      const proposal = project.proposalId ? await Proposal.findById(project.proposalId) : null;
      let stage1Status     = 'active';
      let stage1ProposalId = null;

      if (proposal) {
        stage1ProposalId = proposal._id;
        if (proposal.status === 'approved') stage1Status = 'completed';
        else if (proposal.status === 'pending') stage1Status = 'submitted';
        // rejected / draft → remains 'active'
      }

      const stage1Completed = stage1Status === 'completed';

      const stageDocs = sortedStages.map((s, index) => {
        const doc = {
          projectId:  project._id,
          groupId:    group._id,
          stageOrder: s.order,
          stageName:  index === 0 ? 'Proposal Submission' : s.name,
          deadline:   s.deadline,
          status:     index === 0 ? stage1Status : (index === 1 && stage1Completed) ? 'active' : 'locked',
          proposalId: index === 0 ? stage1ProposalId : null,
        };
        if (index === 0 && stage1Status !== 'active') {
          doc.submittedAt = proposal?.createdAt ?? new Date();
        }
        if (index === 0 && stage1Completed) {
          doc.advisorReview = { status: 'approved', feedback: '', reviewedAt: proposal?.updatedAt ?? new Date() };
          doc.adminReview   = { status: 'approved', feedback: '', reviewedAt: proposal?.updatedAt ?? new Date() };
        }
        return doc;
      });
      await ProjectStageProgress.insertMany(stageDocs);
      await ProjectGroup.findByIdAndUpdate(groupId, { isLocked: true, $inc: { projectCount: 1 } });
    }

    // Advance project status only when proposal is already approved
    const linkedProposal = project.proposalId ? await Proposal.findById(project.proposalId) : null;
    let newStatus = project.status;
    if (linkedProposal?.status === 'approved') {
      const stageCount = (await ProjectStageProgress.countDocuments({ projectId: project._id, groupId })) || group.stages.length;
      newStatus = stageCount === 2 ? 'under_review' : 'active';
    }
    project.groupId = group._id;
    project.status  = newStatus;
    await project.save();

    await notify({
      recipientId:      project.studentId,
      notificationType: 'system',
      message:          `Your project was assigned to group "${group.name}". Stage tracking is now active.`,
      priority:         'medium',
    });

    const populated = await Project.findById(project._id)
      .populate('studentId', 'fullName email department')
      .populate('mentorId',  'fullName email')
      .populate('proposalId', 'title status')
      .populate('groupId', 'name academicYear stages isLocked');

    res.json({ success: true, data: populated });
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
