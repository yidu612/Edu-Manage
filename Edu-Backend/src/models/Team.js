import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const memberSchema = new mongoose.Schema(
  {
    user:              { type: ObjectId, ref: 'User', required: true },
    role:              { type: String, enum: ['leader', 'member'], default: 'member' },
    invitation_status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    description:  { type: String, trim: true },
    code:         { type: String, unique: true, uppercase: true },
    creator:      { type: ObjectId, ref: 'User', required: true },
    status:       { type: String, enum: ['active', 'approved', 'rejected'], default: 'active' },
    is_finalized: { type: Boolean, default: false },
    members:      { type: [memberSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Team', teamSchema);
