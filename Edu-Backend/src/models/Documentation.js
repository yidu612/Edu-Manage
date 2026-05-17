import mongoose from 'mongoose';

const documentationSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    documentType: {
      type: String,
      enum: ['report', 'presentation', 'code', 'code_link', 'demo_link', 'other'],
      required: true,
    },
    name:       { type: String, required: true },
    url:        { type: String, required: true },
    size:       { type: Number, default: 0 },
    status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    version:    { type: Number, default: 1 },
    isLatest:   { type: Boolean, default: true },
    replacedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Documentation', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Documentation', documentationSchema);
