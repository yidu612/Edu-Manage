import Milestone from '../models/Milestone.js';
import Project from '../models/Project.js';
import { notify } from '../utils/notify.js';

export const updateMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    const allowed = ['name', 'description', 'deadline', 'status'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.deadline) updates.deadline = new Date(updates.deadline);
    if (updates.status === 'completed' && milestone.status !== 'completed') {
      updates.completedAt = new Date();
    }

    const updated = await Milestone.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (updates.status === 'completed') {
      const project = await Project.findById(milestone.projectId);
      if (project?.mentorId) {
        await notify({
          recipientId:      project.mentorId,
          notificationType: 'milestone',
          message:          `Milestone "${milestone.name}" has been marked as completed.`,
          priority:         'medium',
        });
      }
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });
    res.json({ success: true, data: milestone });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
