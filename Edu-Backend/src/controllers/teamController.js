import Team from '../models/Team.js';

const POPULATE_CREATOR = 'fullName email';
const POPULATE_MEMBER  = 'fullName email department';

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function uniqueCode() {
  let code;
  do { code = generateCode(); } while (await Team.findOne({ code }));
  return code;
}

function formatTeam(team) {
  const t = team.toObject({ virtuals: true });
  t.members = t.members.map((m) => ({
    ...m,
    user_id: m.user?._id ?? m.user,
    user: m.user
      ? {
          id:         m.user._id,
          name:       m.user.fullName,
          fullName:   m.user.fullName,
          email:      m.user.email,
          department: m.user.department,
        }
      : null,
  }));
  return t;
}

// GET /api/teams — student: own accepted teams; admin: all
export const getTeams = async (req, res) => {
  try {
    const { role, _id } = req.user;
    const query =
      role === 'admin'
        ? {}
        : { members: { $elemMatch: { user: _id, invitation_status: 'accepted' } } };

    const teams = await Team.find(query)
      .populate('creator', POPULATE_CREATOR)
      .populate('members.user', POPULATE_MEMBER)
      .sort({ createdAt: -1 });

    res.json({ success: true, data: teams.map(formatTeam) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/teams/my — student's active (accepted) team
export const getMyTeam = async (req, res) => {
  try {
    const team = await Team.findOne({
      members: { $elemMatch: { user: req.user._id, invitation_status: 'accepted' } },
    })
      .populate('creator', POPULATE_CREATOR)
      .populate('members.user', POPULATE_MEMBER);

    res.json({ success: true, data: team ? formatTeam(team) : null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/teams/:id
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('creator', POPULATE_CREATOR)
      .populate('members.user', POPULATE_MEMBER);

    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, data: formatTeam(team) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/teams — create (student becomes leader)
export const createTeam = async (req, res) => {
  try {
    const existing = await Team.findOne({
      members: { $elemMatch: { user: req.user._id, invitation_status: 'accepted' } },
    });
    if (existing)
      return res.status(400).json({ success: false, message: 'You already belong to an active team.' });

    const { name, description } = req.body;
    if (!name?.trim())
      return res.status(400).json({ success: false, message: 'Team name is required.' });

    const code = await uniqueCode();
    const team = await Team.create({
      name:    name.trim(),
      description: description?.trim(),
      code,
      creator: req.user._id,
      members: [{ user: req.user._id, role: 'leader', invitation_status: 'accepted' }],
    });

    await team.populate('creator', POPULATE_CREATOR);
    await team.populate('members.user', POPULATE_MEMBER);
    res.status(201).json({ success: true, data: formatTeam(team) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/teams/join — join by invite code
export const joinTeamByCode = async (req, res) => {
  try {
    const { code } = req.body;
    const team = await Team.findOne({ code: code?.toUpperCase() });
    if (!team) return res.status(404).json({ success: false, message: 'Invalid invite code.' });

    const already = team.members.find((m) => m.user.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ success: false, message: 'Already a member of this team.' });

    team.members.push({ user: req.user._id, role: 'member', invitation_status: 'accepted' });
    await team.save();
    await team.populate('creator', POPULATE_CREATOR);
    await team.populate('members.user', POPULATE_MEMBER);
    res.json({ success: true, data: formatTeam(team) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/teams/:id/invite — leader invites a user
export const inviteMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const isLeader = team.members.find(
      (m) => m.user.toString() === req.user._id.toString() && m.role === 'leader'
    );
    if (!isLeader) return res.status(403).json({ success: false, message: 'Only the team leader can invite members.' });

    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ success: false, message: 'user_id is required.' });

    const already = team.members.find((m) => m.user.toString() === user_id.toString());
    if (already) return res.status(400).json({ success: false, message: 'User is already in the team.' });

    team.members.push({ user: user_id, role: 'member', invitation_status: 'pending' });
    await team.save();
    res.json({ success: true, message: 'Invitation sent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/teams/:id/leave
export const leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    team.members = team.members.filter((m) => m.user.toString() !== req.user._id.toString());
    await team.save();
    res.json({ success: true, message: 'You have left the team.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/teams/:id/members/:memberId — leader removes member
export const removeMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const isLeader = team.members.find(
      (m) => m.user.toString() === req.user._id.toString() && m.role === 'leader'
    );
    if (!isLeader && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Only the team leader can remove members.' });

    team.members = team.members.filter((m) => m.user.toString() !== req.params.memberId);
    await team.save();
    res.json({ success: true, message: 'Member removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
