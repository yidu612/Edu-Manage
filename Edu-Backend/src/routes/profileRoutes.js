import express from "express";
import {
  updateUserProfile,
  getAllUserProfiles,
  getUserById,
  uploadProfileImage,
  getStudents,
  getTeachers,
  getExaminers,
  getPeers,
} from "../controllers/userProfileController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getAllUserProfiles);
router.get("/students",  getStudents);
router.get("/teachers",  getTeachers);
router.get("/examiners", getExaminers);
router.get("/peers",     getPeers);
router.put("/update", uploadProfileImage, updateUserProfile);
router.get("/:id", getUserById);

export default router;
