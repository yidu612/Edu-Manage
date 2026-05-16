import express from "express";
import {
  getProposal,
  updateProposal,
  deleteProposal,
  getAllProposals,
  submitProposal,
  reviewProposal,
  uploadProposalFile,
} from "../controllers/proposalController.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import checkRole from "../middleware/roleCheck.js";

const router = express.Router();

router.use(protectRoute);

router.get("/",    getAllProposals);
router.get("/:id", getProposal);
router.put("/:id", updateProposal);
router.delete("/:id", deleteProposal);
router.post("/submit", checkRole(["student"]), uploadProposalFile, submitProposal);
router.put("/:id/review", checkRole(["teacher", "admin"]), reviewProposal);

export default router;
