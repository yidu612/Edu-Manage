import cloudinary from "../config/cloudinary.js";
import upload from "../middleware/multer.js";
import Proposal from "../models/Proposal.js";
import Project from "../models/Project.js";
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

// Submit a new proposal
export const submitProposal = async (req, res) => {
  try {
    const { title, teacherId, abstract, objectives, methodology, department, expectedOutcomes, force } = req.body;

    if (!title) return res.status(400).json({ success: false, message: "Title is required" });

    // Duplicate detection — compare abstract against existing non-draft proposals
    if (abstract && force !== 'true') {
      const existing = await Proposal.find({ status: { $ne: 'draft' } }).select('title abstract _id').lean();
      let maxSimilarity = 0;
      let matchedTitle = null;
      for (const p of existing) {
        if (!p.abstract) continue;
        const score = computeSimilarity(abstract, p.abstract);
        if (score > maxSimilarity) {
          maxSimilarity = score;
          matchedTitle = p.title;
        }
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
      status: "pending",
      attachments,
    });

    const saved = await proposal.save();
    const populated = await Proposal.findById(saved._id)
      .populate("student", "fullName email department")
      .populate("teacher", "fullName email department");

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

    // Auto-create a Project when a proposal is approved for the first time
    if (status === 'approved' && !proposal.projectId) {
      const project = await Project.create({
        title:          proposal.title,
        abstract:       proposal.abstract,
        objectives:     proposal.objectives,
        studentId:      proposal.student,
        status:         'submitted',
        submissionDate: new Date(),
      });
      proposal.projectId = project._id;

      await notify({
        recipientId:      proposal.student,
        notificationType: 'system',
        message:          `Your proposal "${proposal.title}" was approved! A project has been created for you.`,
        priority:         'high',
      });
    }

    if (status === 'rejected') {
      await notify({
        recipientId:      proposal.student,
        notificationType: 'system',
        message:          `Your proposal "${proposal.title}" was not approved.${comment ? ` Feedback: ${comment}` : ''}`,
        priority:         'high',
      });
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
