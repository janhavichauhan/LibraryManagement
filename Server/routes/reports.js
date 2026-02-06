import express from "express";
import { getOverdue, getTopBooks } from "../controllers/reportController.js";

const router = express.Router();

router.get("/overdue", getOverdue);

router.get("/top-books", getTopBooks);

export default router;
