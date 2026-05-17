import Project from '../models/Project.js';
import Team from '../models/Team.js';
import User from '../models/user.model.js';
import { notify } from '../utils/notify.js';
import mongoose from 'mongoose';
import { ROLES } from '../config/roles.js';

function requireDepartment(req, res) {
  const { department } = req.user;
  if (!department) {
    res.status(400).json({
      success: false,
      message: 'Your account has no department assigned. Contact an administrator.',
    });
    return null;
  }
  return department;
}

// GET /api/coordinator/projects
export const getProjectsByDepartment = async (req, res) => {
  const department = requireDepartment(req, res);
  if (!department) return;

  try {
    const students = await User.find({ role: ROLES.STUDENT, department }).select('_id');
    const studentIds = students.map((s) => s._id);

    const projects = await Project.find({ studentId: { $in: studentIds } })
      .populate('studentId', 'fullName email department')
      .populate('mentorId', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: projects });
  } catch (err) {
    console.error('getProjectsByDepartment error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/coordinator/teams
export const getTeamsByDepartment = async (req, res) => {
  const department = requireDepartment(req, res);
  if (!department) return;

  try {
    const deptUsers = await User.find({ department }).select('_id');
    const deptUserIds = deptUsers.map((u) => u._id);

    const teams = await Team.find({
      $or: [
        { creator:      { $in: deptUserIds } },
        { 'members.user': { $in: deptUserIds } },
      ],
    })
      .populate('creator', 'fullName email department')
      .populate('members.user', 'fullName email department')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: teams });
  } catch (err) {
    console.error('getTeamsByDepartment error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/coordinator/assign-mentor
export const assignMentorInDepartment = async (req, res) => {
  const department = requireDepartment(req, res);
  if (!department) return;

  const { projectId, mentorId } = req.body;

  if (!projectId || !mentorId) {
    return res.status(400).json({ success: false, message: 'projectId and mentorId are required' });
  }
  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(mentorId)) {
    return res.status(400).json({ success: false, message: 'Invalid projectId or mentorId' });
  }

  try {
    const mentor = await User.findOne({ _id: mentorId, role: ROLES.TEACHER, department });
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Teacher not found in your department' });
    }

    const students = await User.find({ role: ROLES.STUDENT, department }).select('_id');
    const studentIds = students.map((s) => s._id);

    const project = await Project.findOneAndUpdate(
      { _id: projectId, studentId: { $in: studentIds } },
      { mentorId },
      { new: true }
    )
      .populate('studentId', 'fullName email')
      .populate('mentorId', 'fullName email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found in your department' });
    }

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
    console.error('assignMentorInDepartment error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
