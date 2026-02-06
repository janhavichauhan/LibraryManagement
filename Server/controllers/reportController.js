import Loan from "../models/Loan.js";
import Book from "../models/Book.js";

export const getOverdue = async (req, res) => {
  try {
    const today = new Date();
    const loans = await Loan.find({ dueDate: { $lt: today } })
      .populate("book")
      .populate("member");
      
    loans.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTopBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .sort({ checkoutCount: -1, title: 1 }) 
      .limit(5);

    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};