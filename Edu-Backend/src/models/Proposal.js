import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectTitle: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'needs_revision'],
    default: 'pending'
  },
  sections: [{
    title: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    strengths: { type: String, required: true },
    areasForImprovement: { type: String, required: true },
    comments: { type: String, required: true }
  }],
  attachments: [{
    fileName: { type: String, required: true },
    size: { type: String, required: true },
    downloadLink: { type: String, required: true }
  }]
}, { timestamps: true });

const proposalSchema = new mongoose.Schema({
  title:            { type: String, required: true },
  abstract:         { type: String },
  objectives:       { type: String },
  methodology:      { type: String },
  expectedOutcomes: { type: String },
  department:       { type: String },
  student:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacher:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'pending'
  },
  attachments: [{
    name: { type: String, required: true },
    url:  { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true }
  }],
  feedbackList: { type: [feedbackSchema], default: [] }
}, { timestamps: true });

proposalSchema.set('toJSON', { virtuals: true });
proposalSchema.set('toObject', { virtuals: true });

export default mongoose.model('Proposal', proposalSchema);
