import DefenseSession from '../models/DefenseSession.js';
import mongoose from 'mongoose';

// GET /api/examiner/defense-sessions
export const getMyDefenseSessions = async (req, res) => {
  try {
    const sessions = await DefenseSession.find({ examiners: req.user._id })
      .populate('projectId', 'title abstract studentId')
      .populate('examiners', 'fullName email')
      .sort({ scheduledAt: 1 });

    res.json({ success: true, data: sessions });
  } catch (err) {
    console.error('getMyDefenseSessions error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/examiner/defense-sessions/:id/score
export const submitScore = async (req, res) => {
  const { id } = req.params;
  const { score, comments } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid session ID' });
  }
  if (score === undefined || score < 0 || score > 100) {
    return res.status(400).json({ success: false, message: 'Score must be between 0 and 100' });
  }

  try {
    const session = await DefenseSession.findOne({
      _id: id,
      examiners: req.user._id,
      status: 'scheduled',
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Defense session not found, not assigned to you, or already completed',
      });
    }

    const existingIdx = session.scores.findIndex(
      (s) => s.examinerId.toString() === req.user._id.toString()
    );

    if (existingIdx !== -1) {
      session.scores[existingIdx].score = score;
      session.scores[existingIdx].comments = comments ?? '';
      session.scores[existingIdx].submittedAt = new Date();
    } else {
      session.scores.push({
        examinerId:  req.user._id,
        score,
        comments:    comments ?? '',
        submittedAt: new Date(),
      });
    }

    await session.save();
    res.json({ success: true, message: 'Score submitted', data: session });
  } catch (err) {
    console.error('submitScore error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
