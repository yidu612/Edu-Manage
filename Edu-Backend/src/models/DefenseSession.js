import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema(
  {
    examinerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score:       { type: Number, min: 0, max: 100 },
    comments:    { type: String },
    submittedAt: { type: Date },
  },
  { _id: false }
);

const defenseSessionSchema = new mongoose.Schema(
  {
    projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    scheduledAt: { type: Date, required: true },
    location:    { type: String },
    examiners:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    scores:      { type: [scoreSchema], default: [] },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    finalScore: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model('DefenseSession', defenseSessionSchema);
