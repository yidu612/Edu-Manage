import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import projectRoutes from "./routes/projectRoutes.js";
import milestoneRoutes from "./routes/milestoneRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import proposalFeedbackRoutes from "./routes/proposalFeedbackRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import projectFeedbackRoutes from "./routes/projectFeedbackRoutes.js";
import discussionRoutes from "./routes/discussionRoutes.js";
import publicProjectRoutes from "./routes/publicProjectRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import coordinatorRoutes from "./routes/coordinatorRoutes.js";
import examinerRoutes from "./routes/examinerRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

// Middleware
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/users", profileRoutes);
app.use("/api/feedback", proposalFeedbackRoutes);
app.use("/api/project", projectFeedbackRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/public/projects", publicProjectRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/coordinator", coordinatorRoutes);
app.use("/api/examiner", examinerRoutes);
app.use("/api/ai", aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
