import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    name:        { type: String, required: true },
    description: { type: String },
    deadline:    { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'overdue'],
      default: 'pending',
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Milestone', milestoneSchema);
