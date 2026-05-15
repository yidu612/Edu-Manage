import Notification from '../models/Notification.js';

/**
 * Create a notification document. Non-fatal — logs on failure instead of throwing.
 * @param {{ recipientId, notificationType, message, priority? }} opts
 */
export const notify = async ({ recipientId, notificationType, message, priority = 'low' }) => {
  try {
    const n = new Notification({ recipientId, notificationType, message, priority });
    await n.save();
    return n;
  } catch (err) {
    console.error('[notify] Failed to create notification:', err.message);
  }
};
