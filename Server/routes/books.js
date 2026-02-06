import express from "express";
import {
  addBook,
  getBooks,
  deleteBook,
  lendBook,
  returnBook,
  populateBooks 
} from "../controllers/bookController.js";

const router = express.Router();

router.post("/addBook", addBook);
router.get("/getBooks", getBooks);
router.delete("/:bookId", deleteBook);
router.post("/:bookId/lend", lendBook);
router.post("/:bookId/return", returnBook);
router.post("/populate", populateBooks); 

export default router;