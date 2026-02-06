import express from "express";
import {
  addBook,
  getBooks,
  lendBook,
  returnBook
} from "../controllers/bookController.js";

const router = express.Router();

router.post("/addBook", addBook);
router.get("/getBooks", getBooks);
router.post("/:bookId/lend", lendBook);
router.post("/:bookId/return", returnBook);

export default router;
