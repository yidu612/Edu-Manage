import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    projectId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    type: {
      type: String,
      enum: ['proposal', 'report', 'presentation', 'code'],
      required: true,
    },
    version:      { type: String, default: '1.0' },
    fileType:     { type: String },
    filePath:     { type: String, required: true },
    uploadedDate: { type: Date, default: Date.now },
    uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);
