import ProjectGroup from '../models/ProjectGroup.js';

export const createProjectGroup = async (req, res) => {
  try {
    const { name, academicYear, description, stages } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'name is required' });
    if (!Array.isArray(stages) || stages.length < 2) {
      return res.status(400).json({ success: false, message: 'At least 2 stages are required' });
    }

    const sortedStages = stages
      .map((s, i) => ({ order: s.order ?? i + 1, name: s.name, deadline: new Date(s.deadline) }))
      .sort((a, b) => a.order - b.order);

    for (const s of sortedStages) {
      if (!s.name) return res.status(400).json({ success: false, message: 'Each stage must have a name' });
      if (isNaN(s.deadline)) return res.status(400).json({ success: false, message: `Invalid deadline for stage "${s.name}"` });
    }

    const group = await ProjectGroup.create({
      name, academicYear, description,
      stages: sortedStages,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: group });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getProjectGroups = async (req, res) => {
  try {
    const groups = await ProjectGroup.find()
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProjectGroup = async (req, res) => {
  try {
    const group = await ProjectGroup.findById(req.params.id).populate('createdBy', 'fullName email');
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    res.json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProjectGroup = async (req, res) => {
  try {
    const group = await ProjectGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const { name, academicYear, description, stages } = req.body;
    if (name !== undefined) group.name = name;
    if (academicYear !== undefined) group.academicYear = academicYear;
    if (description !== undefined) group.description = description;

    if (stages !== undefined) {
      if (group.isLocked) {
        return res.status(400).json({
          success: false,
          message: 'Stage configuration is immutable — projects have already been assigned to this group',
        });
      }
      group.stages = stages
        .map((s, i) => ({ order: s.order ?? i + 1, name: s.name, deadline: new Date(s.deadline) }))
        .sort((a, b) => a.order - b.order);
    }

    await group.save();
    res.json({ success: true, data: group });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
