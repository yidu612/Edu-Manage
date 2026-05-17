import mongoose from 'mongoose';

// ─── NEW ACADEMIC SCHEMA (Phase 2) ───────────────────────────────────────────

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    objectives: { type: String },
    abstract:   { type: String },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
      default: 'draft',
    },
    category:           { type: String },
    keywords:           { type: [String], default: [] },
    similarityScore:    { type: Number, min: 0, max: 100, default: 0 },
    submissionDate:     { type: Date },
    progressPercentage: { type: Number, min: 0, max: 100, default: 0 },
    repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository' },
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);

// ─── OLD PORTFOLIO FIELDS (kept for reference — do not restore without migration) ─
//
// tags: { type: [String], default: [] },
// coverImage: { type: String },
// elevatorPitch: { type: String, required: true },
// projectDescription: { type: String },
// teamMembers: [teamMemberSchema],
// toolsAndMachines: toolsAndMachinesSchema,
// appsAndPlatforms: [appPlatformSchema],
// codeAndDocumentation: codeAndDocumentationSchema,
// comments: [commentSchema],
// views: { type: Number, default: 0 },
// status: { type: Boolean, default: false },          ← was boolean, now string enum
// reviewedByTeacherId: { type: ObjectId, ref: 'User' },
// likes: [{ type: ObjectId, ref: 'User' }],
