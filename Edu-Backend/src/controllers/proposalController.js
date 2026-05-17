import cloudinary from "../config/cloudinary.js";
import upload from "../middleware/multer.js";
import Proposal from "../models/Proposal.js";
import Project from "../models/Project.js";
import ProjectGroup from "../models/ProjectGroup.js";
import ProjectStageProgress from "../models/ProjectStageProgress.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { computeSimilarity } from "../utils/similarity.js";
import { notify } from "../utils/notify.js";

// Get proposals for the current user (student → own; teacher → assigned; admin → all)
export const getAllProposals = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "student") filter.student = req.user._id;
    else if (req.user.role === "teacher") filter.teacher = req.user._id;

    const proposals = await Proposal.find(filter)
      .populate("student", "fullName email department")
      .populate("teacher", "fullName email department")
      .populate("projectId", "title status")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: proposals.length, data: proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving proposals", error: error.message });
  }
};

// Get a single proposal by ID
export const getProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate("student", "fullName email department")
      .populate("teacher", "fullName email department")
      .populate("feedbackList.teacher", "fullName email")
      .populate("projectId", "title status");

    if (!proposal) return res.status(404).json({ success: false, message: "Proposal not found" });
    res.status(200).json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving proposal", error: error.message });
  }
};

// Update a proposal (student updates own draft)
export const updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: "Proposal not found" });

    if (req.user.role === "student" && proposal.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Block status changes through this endpoint (use /review instead)
    delete req.body.status;
    delete req.body.student;

    const updated = await Proposal.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    })
      .populate("student", "fullName email department")
      .populate("teacher", "fullName email department");

    res.status(200).json({ success: true, message: "Proposal updated", data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: "Error updating proposal", error: error.message });
  }
};

// Delete a proposal
export const deleteProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: "Proposal not found" });

    if (proposal.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await proposal.deleteOne();
    res.status(200).json({ success: true, message: "Proposal deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting proposal", error: error.message });
  }
};

// Middleware — multer + optional Cloudinary upload
export const uploadProposalFile = (req, res, next) => {
  upload.single("proposalFile")(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) return next(); // no file attached — proceed without it

    cloudinary.uploader.upload(req.file.path, { resource_type: "raw" }, (uploadErr, result) => {
      if (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr.message);
        return next(); // still proceed even if cloud upload fails
      }
      req.file = { ...req.file, secure_url: result.secure_url, url: result.url };
      next();
    });
  });
};

// Submit a new proposal — must be linked to an existing student-owned project
export const submitProposal = async (req, res) => {
  try {
    const { title, projectId, teacherId, abstract, objectives, methodology, department, expectedOutcomes, force } = req.body;

    if (!title) return res.status(400).json({ success: false, message: "Title is required" });
    if (!projectId) return res.status(400).json({ success: false, message: "projectId is required — create a project first" });
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid projectId" });
    }

    // Validate project belongs to this student
    const project = await Project.findOne({ _id: projectId, studentId: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: "Project not found or not owned by you" });

    // Reject if an active (non-rejected) proposal already exists for this project
    const activeProposal = await Proposal.findOne({ projectId, status: { $ne: 'rejected' } });
    if (activeProposal) {
      return res.status(409).json({
        success: false,
        message: `This project already has an active proposal (status: ${activeProposal.status}). It must be rejected before you can submit a new one.`,
      });
    }

    // Duplicate detection — compare abstract against other submitted proposals
    if (abstract && force !== 'true') {
      const existing = await Proposal.find({ status: { $nin: ['draft', 'rejected'] }, projectId: { $ne: projectId } })
        .select('title abstract').lean();
      let maxSimilarity = 0;
      let matchedTitle = null;
      for (const p of existing) {
        if (!p.abstract) continue;
        const score = computeSimilarity(abstract, p.abstract);
        if (score > maxSimilarity) { maxSimilarity = score; matchedTitle = p.title; }
      }
      if (maxSimilarity > 30) {
        return res.status(409).json({
          success: false,
          message: `Abstract is ${maxSimilarity}% similar to an existing proposal: "${matchedTitle}". Check the "Submit anyway" box to proceed.`,
          similarityScore: maxSimilarity,
          matchedTitle,
        });
      }
    }

    if (teacherId) {
      if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({ success: false, message: "Invalid teacher ID" });
      }
      const teacher = await User.findOne({ _id: teacherId, role: "teacher" });
      if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const attachments = req.file
      ? [{ name: req.file.originalname, url: req.file.secure_url || req.file.url || req.file.path, type: req.file.mimetype, size: req.file.size || 0 }]
      : [];

    const proposal = new Proposal({
      title, abstract, objectives, methodology, department, expectedOutcomes,
      student: req.user._id,
      teacher: teacherId || undefined,
      projectId,
      status: "pending",
      attachments,
    });

    const saved = await proposal.save();

    // Advance project to submitted state and link proposal
    await Project.findByIdAndUpdate(projectId, {
      status: 'submitted',
      proposalId: saved._id,
    });

    const populated = await Proposal.findById(saved._id)
      .populate("student", "fullName email department")
      .populate("teacher", "fullName email department")
      .populate("projectId", "title status");

    res.status(201).json({ success: true, message: "Proposal submitted", data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error submitting proposal", error: error.message });
  }
};

// Teacher/admin: approve or reject a proposal
export const reviewProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: "Proposal not found" });

    const { status, comment } = req.body;
    const valid = ['approved', 'rejected', 'pending'];
    if (!status || !valid.includes(status)) {
      return res.status(400).json({ success: false, message: "Valid status required: approved, rejected, pending" });
    }

    proposal.status = status;

    if (comment) {
      proposal.feedbackList.push({
        teacher: req.user._id,
        projectTitle: proposal.title,
        status,
        sections: [{
          title: "Review Decision",
          rating: status === 'approved' ? 5 : 2,
          strengths: comment,
          areasForImprovement: status === 'rejected' ? comment : "N/A",
          comments: comment,
        }],
      });
    }

    // Advance or reset the linked project based on the review decision
    if (proposal.projectId) {
      if (status === 'approved') {
        // Admin must supply a Project Group when approving
        if (req.user.role === 'admin') {
          const { groupId } = req.body;
          if (!groupId) {
            return res.status(400).json({ success: false, message: 'groupId is required when approving a proposal as admin' });
          }
          const group = await ProjectGroup.findById(groupId);
          if (!group) return res.status(404).json({ success: false, message: 'Project group not found' });
          if (!group.stages || group.stages.length < 2) {
            return res.status(400).json({ success: false, message: 'Project group must have at least 2 stages' });
          }

          const sortedStages = [...group.stages].sort((a, b) => a.order - b.order);

          // Build ProjectStageProgress records: stage 1 = completed (proposal approved), stage 2 = active, rest = locked
          const stageDocs = sortedStages.map((s, index) => ({
            projectId:  proposal.projectId,
            groupId:    group._id,
            stageOrder: s.order,
            stageName:  s.name,
            deadline:   s.deadline,
            status:     index === 0 ? 'completed' : index === 1 ? 'active' : 'locked',
          }));
          await ProjectStageProgress.insertMany(stageDocs);

          // Lock the group and increment its project count
          await ProjectGroup.findByIdAndUpdate(groupId, { isLocked: true, $inc: { projectCount: 1 } });

          // Project status: 'under_review' if only 2 stages (last stage now active), else 'active'
          const newProjectStatus = sortedStages.length === 2 ? 'under_review' : 'active';
          await Project.findByIdAndUpdate(proposal.projectId, { status: newProjectStatus, groupId: group._id });

          await notify({
            recipientId:      proposal.student,
            notificationType: 'system',
            message:          `Your proposal "${proposal.title}" was approved! Your project is now active — proceed to ${sortedStages[1].name}.`,
            priority:         'high',
          });
        } else {
          // Teacher approval path (no group assignment)
          await Project.findByIdAndUpdate(proposal.projectId, { status: 'active' });
          await notify({
            recipientId:      proposal.student,
            notificationType: 'system',
            message:          `Your proposal "${proposal.title}" was approved by your advisor!`,
            priority:         'high',
          });
        }
      } else if (status === 'rejected') {
        await Project.findByIdAndUpdate(proposal.projectId, { status: 'draft', proposalId: null });
        await notify({
          recipientId:      proposal.student,
          notificationType: 'system',
          message:          `Your proposal "${proposal.title}" was not approved.${comment ? ` Feedback: ${comment}` : ''} You may revise and resubmit.`,
          priority:         'high',
        });
      }
    }

    await proposal.save();
    const populated = await Proposal.findById(proposal._id)
      .populate("student", "fullName email")
      .populate("teacher", "fullName email")
      .populate("feedbackList.teacher", "fullName email")
      .populate("projectId", "title status");

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
