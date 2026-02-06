import express from "express";
import { addMember, getMembers } from "../controllers/memberController.js";

const router = express.Router();

router.post("/addMember", addMember);

router.get("/getMembers", getMembers);

export default router;
