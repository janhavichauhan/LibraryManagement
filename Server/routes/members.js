import express from "express";
import { addMember, getMembers, deleteMember } from "../controllers/memberController.js";

const router = express.Router();

router.post("/addMember", addMember);

router.get("/getMembers", getMembers);

router.delete("/:memberId", deleteMember);

export default router;
