import Book from "../models/Book.js";
import Loan from "../models/Loan.js";
import Member from "../models/Member.js";
import axios from "axios";

export const addBook = async (req, res) => {
  try {
    const { title, author, tags, coverImage } = req.body;
    const existing = await Book.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } });
    if (existing) return res.status(400).json({ message: "Book with this title already exists." });

    const newBook = await Book.create({ title, author, tags, coverImage });
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const lendBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { memberId } = req.body;

    const book = await Book.findById(bookId);
    const member = await Member.findById(memberId);

    if (!book || !member) return res.status(404).json({ message: "Book or Member not found" });

    if (book.status === "AVAILABLE") {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const loan = await Loan.create({ book: book._id, member: member._id, dueDate });
      
      book.status = "BORROWED";
      book.checkoutCount += 1; 
      await book.save();

      member.activeLoans.push(loan._id);
      await member.save();

      return res.json({ message: "Book borrowed successfully", loan });
    }

    if (book.status === "BORROWED") {
      if (book.waitlist.includes(memberId)) {
        return res.status(400).json({ message: "Member already in waitlist" });
      }
      book.waitlist.push(memberId);
      await book.save();
      return res.json({ message: "Book is currently borrowed. Member added to waitlist." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const populateBooks = async (req, res) => {
    try {
        const { genre } = req.body;
        const response = await axios.get(`https://openlibrary.org/subjects/${genre.toLowerCase()}.json?limit=10`);
        
        const works = response.data.works;
        let addedCount = 0;

        for (const work of works) {
          const title = work.title;
          const author = work.authors?.[0]?.name || "Unknown";
          const coverImage = work.cover_id
            ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg`
            : "";

          const exists = await Book.findOne({ title: title });
          if (!exists) {
            await Book.create({
              title,
              author,
              tags: [genre, "imported"],
              status: "AVAILABLE",
              coverImage
            });
            addedCount++;
          }
        }
        res.json({ message: `Successfully added ${addedCount} books for genre '${genre}'` });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch from external API" });
    }
}

export const getBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId);
    
    if (!book) return res.status(404).json({ message: "Book not found" });
    
    if (book.status === "BORROWED" || book.status === "LOANED") {
      return res.status(400).json({ message: "Cannot delete a book that is currently borrowed" });
    }
    
    await Loan.deleteMany({ book: bookId });
    
    await Book.findByIdAndDelete(bookId);
    
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const returnBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId).populate("waitlist");
    
    const currentLoan = await Loan.findOne({ book: bookId });
    
    if (currentLoan) {
        await Member.findByIdAndUpdate(currentLoan.member, { 
            $pull: { activeLoans: currentLoan._id } 
        });
        await Loan.findByIdAndDelete(currentLoan._id); 
    }

    if (book.waitlist.length > 0) {
      const nextMemberId = book.waitlist.shift();
      const nextMember = await Member.findById(nextMemberId);

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      
      const newLoan = await Loan.create({ 
          book: book._id, 
          member: nextMember._id, 
          dueDate 
      });
      
      nextMember.activeLoans.push(newLoan._id);
      await nextMember.save();

      book.checkoutCount += 1;
      await book.save();

      return res.json({ 
        message: `Returned early! Automatically assigned to next in waitlist: ${nextMember.firstName} ${nextMember.lastName}`,
        action: "ASSIGNED_TO_WAITLIST"
      });

    } else {
      book.status = "AVAILABLE"; 
      await book.save();
      
      return res.json({ 
        message: "Book returned early and added back to the library.", 
        action: "MADE_AVAILABLE" 
      });
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};