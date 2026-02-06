import Loan from "../models/Loan.js";
import Book from "../models/Book.js";

// 1. Overdue Report
export const getOverdue = async (req, res) => {
  try {
    const today = new Date();
    // Find loans where dueDate is less than today
    const loans = await Loan.find({ dueDate: { $lt: today } })
      .populate("book")
      .populate("member");
      
    // Sort by days overdue (descending)
    loans.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // Oldest due date first = most overdue

    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Top Books Report
export const getTopBooks = async (req, res) => {
  try {
    // Top 5 books, tie-break by title
    const books = await Book.find()
      .sort({ checkoutCount: -1, title: 1 }) 
      .limit(5);

    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};