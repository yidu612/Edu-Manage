import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const discussionSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // optional — general if null
    author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:     { type: String, required: true },
    content:   { type: String, required: true },
    replies:   { type: [replySchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Discussion', discussionSchema);
