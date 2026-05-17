import mongoose from "mongoose";
import { ALL_ROLES } from "../config/roles.js";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      required: true,
      enum: ALL_ROLES,
    },
    // Student specific fields
    department: String,
    bio: String,
    imageUrl: {
      type: String,
    },
    phone: String,
    location: String,
    socialLinks: [
      {
        platform: String,
        url: String,
      },
    ],
    skills: [
      {
        type: String,
      },
    ],
    approvalStatus: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: function () {
        return this.role === 'teacher' ? 'pending' : 'approved';
      },
    },
    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
