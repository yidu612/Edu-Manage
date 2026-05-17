import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const stageDocSchema = new mongoose.Schema({
  name: String,
  url:  String,
  type: String,
  size: { type: Number, default: 0 },
}, { timestamps: true });

const reviewSchema = {
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: ObjectId, ref: 'User' },
  feedback:   { type: String, default: '' },
  reviewedAt: { type: Date },
};

const projectStageProgressSchema = new mongoose.Schema({
  projectId:  { type: ObjectId, ref: 'Project',      required: true },
  groupId:    { type: ObjectId, ref: 'ProjectGroup',  required: true },
  stageOrder: { type: Number, required: true },
  stageName:  { type: String, required: true },
  deadline:   { type: Date,   required: true },

  status: {
    type: String,
    enum: [
      'locked',           // not yet reachable
      'active',           // student can submit
      'submitted',        // awaiting advisor review
      'advisor_approved', // awaiting admin review
      'advisor_rejected', // advisor sent back — student must resubmit
      'admin_rejected',   // admin sent back — student must resubmit
      'completed',        // both gates passed, stage done
    ],
    default: 'locked',
  },

  submissionNotes: { type: String, default: '' },
  documents:       [stageDocSchema],
  submittedAt:     { type: Date },

  advisorReview: { type: reviewSchema, default: () => ({ status: 'pending' }) },
  adminReview:   { type: reviewSchema, default: () => ({ status: 'pending' }) },
}, { timestamps: true });

projectStageProgressSchema.index({ projectId: 1, stageOrder: 1 }, { unique: true });

export default mongoose.model('ProjectStageProgress', projectStageProgressSchema);
