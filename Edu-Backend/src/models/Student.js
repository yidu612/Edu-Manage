import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    department:   { type: String },
    academicYear: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model('Student', studentSchema);
