import Project from '../models/Project.js';
import User from '../models/user.model.js';
import { notify } from '../utils/notify.js';
import mongoose from 'mongoose';
import { ROLES } from '../config/roles.js';

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
