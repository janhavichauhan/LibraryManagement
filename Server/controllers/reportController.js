import Loan from "../models/Loan.js";
import Book from "../models/Book.js";

export const getOverdue = async (req, res) => {
  try {
    const today = new Date();

    const overdue = await Loan.find({
      dueDate: { $lt: today }
    })
      .populate("book", "title")
      .populate("member", "firstName lastName");

    res.json(overdue);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getTopBooks = async (req, res) => {
  try {
    const n = Number(req.query.n || 5);

    const books = await Book.find()
      .sort({ checkoutCount: -1, title: 1 })
      .limit(n);

    res.json(books);
  } catch (err) {
    res.status(500).json(err);
  }
};
