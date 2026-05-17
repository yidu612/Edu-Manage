import mongoose from 'mongoose';

const stageTemplateSchema = new mongoose.Schema({
  order:    { type: Number, required: true },
  name:     { type: String, required: true, trim: true },
  deadline: { type: Date, required: true },
}, { _id: false });

const projectGroupSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  academicYear: { type: String, trim: true },
  description:  { type: String },
  stages: {
    type: [stageTemplateSchema],
    validate: {
      validator: (v) => Array.isArray(v) && v.length >= 2,
      message:   'A group must define at least 2 stages',
    },
  },
  isLocked:     { type: Boolean, default: false },
  projectCount: { type: Number, default: 0 },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('ProjectGroup', projectGroupSchema);
