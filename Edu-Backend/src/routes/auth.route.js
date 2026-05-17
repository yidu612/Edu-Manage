import express from "express";
import {
  signUp,
  login,
  logout,
  getProfile,
} from "../controllers/auth.controller.js";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/passwordReset.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Public routes
router.post("/signup", upload.single("imageUrl"), signUp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.get("/profile", protectRoute, getProfile);

export default router;
