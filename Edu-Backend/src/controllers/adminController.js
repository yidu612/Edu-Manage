import Project from '../models/Project.js';
import User from '../models/user.model.js';
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
