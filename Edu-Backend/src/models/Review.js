import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, default: '' },
  },
  { timestamps: true }
);

// One review per user per project
reviewSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
