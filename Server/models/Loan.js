import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  member: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
  dueDate: Date
});

export default mongoose.model("Loan", loanSchema);
