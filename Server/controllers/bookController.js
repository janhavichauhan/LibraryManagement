import Book from "../models/Book.js";
import Member from "../models/Member.js";
import Loan from "../models/Loan.js";

export const addBook = async (req, res) => {
  try {
    const { title, author, tags } = req.body;

    const exists = await Book.findOne({
      title: { $regex: new RegExp("^" + title + "$", "i") }
    });

    if (exists) {
      return res.status(400).json({ message: "Duplicate title not allowed" });
    }

    const book = await Book.create({ title, author, tags });
    res.json(book);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getBooks = async (req, res) => {
  try {
    const search = req.query.search || "";

    const books = await Book.find({
      title: { $regex: search, $options: "i" }
    }).populate("waitlist", "firstName lastName");

    res.json(books);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const lendBook = async (req, res) => {
  try {
    const { memberId } = req.body;
    const book = await Book.findById(req.params.bookId);

    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.status === "AVAILABLE") {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const loan = await Loan.create({
        book: book._id,
        member: memberId,
        dueDate
      });

      book.status = "LOANED";
      book.checkoutCount += 1;
      await book.save();

      await Member.findByIdAndUpdate(memberId, {
        $push: { activeLoans: loan._id }
      });

      return res.json({ message: "Book loaned successfully", loan });
    }

    if (!book.waitlist.includes(memberId)) {
      book.waitlist.push(memberId);
      await book.save();
    }

    res.json({ message: "Book on loan. Added to waitlist." });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const returnBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId).populate("waitlist");

    const loan = await Loan.findOneAndDelete({ book: book._id });

    if (loan) {
      await Member.findByIdAndUpdate(loan.member, {
        $pull: { activeLoans: loan._id }
      });
    }

    if (book.waitlist.length > 0) {
      const nextMember = book.waitlist.shift();

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const newLoan = await Loan.create({
        book: book._id,
        member: nextMember._id,
        dueDate
      });

      await Member.findByIdAndUpdate(nextMember._id, {
        $push: { activeLoans: newLoan._id }
      });

      await book.save();

      return res.json({
        message: `Book auto-loaned to ${nextMember.firstName}`
      });
    }

    book.status = "AVAILABLE";
    await book.save();

    res.json({ message: "Book returned successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};
