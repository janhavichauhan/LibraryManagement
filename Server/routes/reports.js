import express from "express";
import { getOverdue, getTopBooks } from "../controllers/reportController.js";

const router = express.Router();

// Overdue Report
router.get("/overdue", getOverdue);

// Top Books Report
router.get("/top-books", getTopBooks);

export default router;
