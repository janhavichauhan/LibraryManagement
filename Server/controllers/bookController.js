import Book from "../models/Book.js";
import Loan from "../models/Loan.js";
import Member from "../models/Member.js";
import axios from "axios";

// 1. Add Book (Reject Duplicates)
export const addBook = async (req, res) => {
  try {
    const { title, author, tags } = req.body;
    // Case-insensitive duplicate check
    const existing = await Book.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } });
    if (existing) return res.status(400).json({ message: "Book with this title already exists." });

    const newBook = await Book.create({ title, author, tags });
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Lend Book (Handle Waitlist)
export const lendBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { memberId } = req.body;

    const book = await Book.findById(bookId);
    const member = await Member.findById(memberId);

    if (!book || !member) return res.status(404).json({ message: "Book or Member not found" });

    // Scenario A: Book is Available -> Lend it
    if (book.status === "AVAILABLE") {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

      const loan = await Loan.create({ book: book._id, member: member._id, dueDate });
      
      book.status = "BORROWED";
      book.checkoutCount += 1; 
      await book.save();

      member.activeLoans.push(loan._id);
      await member.save();

      return res.json({ message: "Book borrowed successfully", loan });
    }

    // Scenario B: Book is Borrowed -> Add to Waitlist
    if (book.status === "BORROWED") {
      // Check if already in waitlist
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


// 4. Populate (Bonus Requirement)
export const populateBooks = async (req, res) => {
    try {
        const { genre } = req.body;
        // Use Open Library API
        const response = await axios.get(`https://openlibrary.org/subjects/${genre.toLowerCase()}.json?limit=10`);
        
        const works = response.data.works;
        let addedCount = 0;

        for (const work of works) {
            const title = work.title;
            const author = work.authors?.[0]?.name || "Unknown";
            
            // Check duplicate
            const exists = await Book.findOne({ title: title });
            if (!exists) {
                await Book.create({
                    title,
                    author,
                    tags: [genre, "imported"],
                    status: "AVAILABLE"
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

// controllers/bookController.js
export const returnBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId).populate("waitlist");
    
    // 1. Find the active loan for this book and close it
    const currentLoan = await Loan.findOne({ book: bookId });
    
    if (currentLoan) {
        // Remove the loan from the member's list
        await Member.findByIdAndUpdate(currentLoan.member, { 
            $pull: { activeLoans: currentLoan._id } 
        });
        // Delete the loan entry (or you could mark it as returned)
        await Loan.findByIdAndDelete(currentLoan._id); 
    }

    // 2. CHECK WAITLIST LOGIC
    if (book.waitlist.length > 0) {
      // Scenario A: Someone is waiting -> Auto-assign to them
      const nextMemberId = book.waitlist.shift(); // Remove first person from line
      const nextMember = await Member.findById(nextMemberId);

      // Create new loan for the next person
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      
      const newLoan = await Loan.create({ 
          book: book._id, 
          member: nextMember._id, 
          dueDate 
      });
      
      nextMember.activeLoans.push(newLoan._id);
      await nextMember.save();

      // Book remains 'BORROWED', just changes hands
      book.checkoutCount += 1;
      await book.save();

      return res.json({ 
        message: `Returned early! Automatically assigned to next in waitlist: ${nextMember.firstName} ${nextMember.lastName}`,
        action: "ASSIGNED_TO_WAITLIST"
      });

    } else {
      // Scenario B: No waitlist -> ADD BACK TO LIBRARY
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