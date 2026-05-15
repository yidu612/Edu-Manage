import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notificationType: {
      type: String,
      enum: ['feedback', 'milestone', 'proposal', 'system'],
      required: true,
    },
    message:   { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isRead:    { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
