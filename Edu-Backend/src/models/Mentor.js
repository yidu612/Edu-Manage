import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema(
  {
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Mentor', mentorSchema);
