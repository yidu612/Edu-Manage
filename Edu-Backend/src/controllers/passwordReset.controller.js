import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import User from "../models/user.model.js";

// SHA-256 is appropriate for lookup tokens (bcrypt is for passwords only).
// The plain token goes to the user; only the hash is stored in the DB.
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendResetEmail(to, resetUrl) {
  const transport = buildTransport();

  const html = `
    <p>You requested a password reset for your EduManage account.</p>
    <p>Click the link below to reset your password. This link is valid for <strong>1 hour</strong>.</p>
    <p><a href="${resetUrl}" style="color:#2563eb">${resetUrl}</a></p>
    <p>If you did not request this, you can safely ignore this email.</p>
  `;

  if (!transport) {
    // No SMTP configured — surface the link in the console so developers
    // can test the flow without a real mail server.
    console.log(`\n[DEV] Password reset link for ${to}:\n${resetUrl}\n`);
    return;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || "EduManage <no-reply@edumanage.local>",
    to,
    subject: "EduManage — Password Reset Request",
    html,
  });
}

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Always return 200 to prevent user enumeration
  const genericResponse = () =>
    res.status(200).json({
      success: true,
      message:
        "If an account is registered for that email, a reset link has been sent.",
    });

  if (!email) return genericResponse();

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return genericResponse();

    // Generate a cryptographically random token
    const plainToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = hashToken(plainToken);
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password?token=${plainToken}`;

    await sendResetEmail(user.email, resetUrl);

    return genericResponse();
  } catch (err) {
    console.error("forgotPassword error:", err.message);
    return genericResponse(); // still generic — don't leak internal errors
  }
};

// POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: "Token and new password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
  }

  try {
    const hashed = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired. Please request a new one.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully. You can now log in with your new password.",
    });
  } catch (err) {
    console.error("resetPassword error:", err.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
