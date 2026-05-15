import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema(
  {
    projectId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    repositoryPath: { type: String },
    archiveDate:    { type: Date, default: Date.now },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Repository', repositorySchema);
