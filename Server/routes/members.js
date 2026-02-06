import express from "express";
import { addMember, getMembers } from "../controllers/memberController.js";

const router = express.Router();

// Add Member
router.post("/addMember", addMember);

// Get All Members
router.get("/getMembers", getMembers);

export default router;
