import cloudinary from '../config/cloudinary.js';
import upload from '../middleware/multer.js';
import ProjectStageProgress from '../models/ProjectStageProgress.js';
import Project from '../models/Project.js';
import { notify } from '../utils/notify.js';

// ─── Multer + Cloudinary middleware for stage file uploads ────────────────────

export const uploadStageFile = (req, res, next) => {
  upload.single('stageFile')(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) return next();
    cloudinary.uploader.upload(req.file.path, { resource_type: 'raw' }, (uploadErr, result) => {
      if (uploadErr) {
        console.error('Stage upload error:', uploadErr.message);
        return next(); // proceed without file rather than failing
      }
      req.file = { ...req.file, secure_url: result.secure_url };
      next();
    });
  });
};

// ─── GET /projects/:id/stages ─────────────────────────────────────────────────

export const getProjectStages = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('groupId', 'name academicYear stages');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (req.user.role === 'student' && project.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const stages = await ProjectStageProgress.find({ projectId: req.params.id })
      .populate('advisorReview.reviewedBy', 'fullName')
      .populate('adminReview.reviewedBy', 'fullName')
      .populate('proposalId', 'title status abstract objectives methodology expectedOutcomes attachments feedbackList')
      .sort({ stageOrder: 1 });

    res.json({ success: true, data: stages, project: { title: project.title, status: project.status, group: project.groupId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /projects/:id/stages/:order/submit (student) ───────────────────────

export const submitStage = async (req, res) => {
  try {
    const { id: projectId, order } = req.params;
    const { notes } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const stage = await ProjectStageProgress.findOne({ projectId, stageOrder: Number(order) });
    if (!stage) return res.status(404).json({ success: false, message: 'Stage not found' });

    if (stage.stageOrder === 1) {
      return res.status(400).json({
        success: false,
        message: 'Stage 1 (Proposal Submission) is managed via the proposals workflow — submit or resubmit your proposal instead.',
      });
    }

    const submittableStates = ['active', 'advisor_rejected', 'admin_rejected'];
    if (!submittableStates.includes(stage.status)) {
      return res.status(400).json({ success: false, message: `Cannot submit — stage is currently: ${stage.status}` });
    }

    if (!notes?.trim() && !req.file) {
      return res.status(400).json({ success: false, message: 'Provide notes or upload a file' });
    }

    const documents = req.file
      ? [{ name: req.file.originalname, url: req.file.secure_url || req.file.path, type: req.file.mimetype, size: req.file.size || 0 }]
      : [];

    stage.documents       = documents;
    stage.submissionNotes = notes?.trim() ?? '';
    stage.status          = 'submitted';
    stage.submittedAt     = new Date();
    stage.advisorReview   = { status: 'pending' };
    stage.adminReview     = { status: 'pending' };
    await stage.save();

    if (project.mentorId) {
      await notify({
        recipientId:      project.mentorId,
        notificationType: 'system',
        message:          `"${project.title}" — ${stage.stageName} submitted for your review.`,
        priority:         'high',
      });
    }

    res.json({ success: true, data: stage });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── PATCH /projects/:id/stages/:order/advisor-review (teacher/admin) ─────────

export const advisorReviewStage = async (req, res) => {
  try {
    const { id: projectId, order } = req.params;
    const { decision, feedback } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'decision must be approved or rejected' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (req.user.role === 'teacher') {
      if (!project.mentorId || project.mentorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Only the assigned advisor can review this stage' });
      }
    }

    const stage = await ProjectStageProgress.findOne({ projectId, stageOrder: Number(order) });
    if (!stage) return res.status(404).json({ success: false, message: 'Stage not found' });
    if (stage.status !== 'submitted') {
      return res.status(400).json({ success: false, message: `Stage must be in submitted state (current: ${stage.status})` });
    }

    stage.advisorReview = {
      status:     decision,
      reviewedBy: req.user._id,
      feedback:   feedback?.trim() ?? '',
      reviewedAt: new Date(),
    };

    if (decision === 'approved') {
      stage.status = 'advisor_approved';
      await stage.save();
      await notify({
        recipientId:      project.studentId,
        notificationType: 'system',
        message:          `Your ${stage.stageName} was approved by your advisor! Awaiting admin review.`,
        priority:         'medium',
      });
    } else {
      stage.status = 'advisor_rejected';
      await stage.save();
      await notify({
        recipientId:      project.studentId,
        notificationType: 'system',
        message:          `Your ${stage.stageName} needs revision. Advisor feedback: ${feedback || 'No specific feedback provided.'}`,
        priority:         'high',
      });
    }

    const populated = await ProjectStageProgress.findById(stage._id)
      .populate('advisorReview.reviewedBy', 'fullName')
      .populate('adminReview.reviewedBy', 'fullName');

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── PATCH /projects/:id/stages/:order/admin-review (admin) ──────────────────

export const adminReviewStage = async (req, res) => {
  try {
    const { id: projectId, order } = req.params;
    const { decision, feedback } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'decision must be approved or rejected' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const stage = await ProjectStageProgress.findOne({ projectId, stageOrder: Number(order) });
    if (!stage) return res.status(404).json({ success: false, message: 'Stage not found' });
    if (stage.status !== 'advisor_approved') {
      return res.status(400).json({ success: false, message: 'Advisor approval required before admin can review' });
    }

    stage.adminReview = {
      status:     decision,
      reviewedBy: req.user._id,
      feedback:   feedback?.trim() ?? '',
      reviewedAt: new Date(),
    };

    if (decision === 'rejected') {
      stage.status = 'admin_rejected';
      await stage.save();
      await notify({
        recipientId:      project.studentId,
        notificationType: 'system',
        message:          `Your ${stage.stageName} was returned by admin. ${feedback ? `Feedback: ${feedback}` : 'Please revise and resubmit.'}`,
        priority:         'high',
      });
      return res.json({ success: true, data: stage });
    }

    // ── Approved: mark complete and advance ───────────────────────────────────
    stage.status = 'completed';
    await stage.save();

    const allStages = await ProjectStageProgress.find({ projectId }).sort({ stageOrder: 1 });
    const totalStages  = allStages.length;
    const currentIndex = allStages.findIndex((s) => s.stageOrder === stage.stageOrder);
    const nextStage    = allStages[currentIndex + 1];

    if (!nextStage) {
      // Final stage — project is complete
      project.status = 'completed';
      await project.save();
      await notify({
        recipientId:      project.studentId,
        notificationType: 'system',
        message:          `Congratulations! Your project "${project.title}" has been fully approved and completed!`,
        priority:         'high',
      });
    } else {
      // Activate the next stage
      nextStage.status = 'active';
      await nextStage.save();

      // Last stage activating → project goes to under_review
      const isLastStage = currentIndex + 1 === totalStages - 1;
      project.status = isLastStage ? 'under_review' : 'active';
      await project.save();

      await notify({
        recipientId:      project.studentId,
        notificationType: 'system',
        message:          `${stage.stageName} approved! ${isLastStage ? 'Final submission is now open.' : `Proceed to ${nextStage.stageName} (deadline: ${new Date(nextStage.deadline).toLocaleDateString()}).`}`,
        priority:         'high',
      });
    }

    const populated = await ProjectStageProgress.findById(stage._id)
      .populate('advisorReview.reviewedBy', 'fullName')
      .populate('adminReview.reviewedBy', 'fullName');

    res.json({ success: true, data: populated, projectStatus: project.status });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── GET /projects/stages/pending (advisor or admin) ─────────────────────────

export const getPendingStageReviews = async (req, res) => {
  try {
    let stages;

    if (req.user.role === 'admin') {
      stages = await ProjectStageProgress.find({ status: 'advisor_approved', stageOrder: { $ne: 1 } })
        .populate({
          path:     'projectId',
          select:   'title studentId mentorId',
          populate: [
            { path: 'studentId', select: 'fullName email' },
            { path: 'mentorId',  select: 'fullName' },
          ],
        })
        .populate('groupId', 'name academicYear')
        .sort({ deadline: 1 });
    } else {
      // Teacher — stages in 'submitted' state for their assigned projects
      const myProjects = await Project.find({ mentorId: req.user._id }).select('_id');
      const ids        = myProjects.map((p) => p._id);
      stages = await ProjectStageProgress.find({ projectId: { $in: ids }, status: 'submitted', stageOrder: { $ne: 1 } })
        .populate({
          path:     'projectId',
          select:   'title studentId',
          populate: { path: 'studentId', select: 'fullName email' },
        })
        .populate('groupId', 'name academicYear')
        .sort({ deadline: 1 });
    }

    res.json({ success: true, data: stages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
