import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  author: String,
  tags: [String],
  status: { type: String, default: "AVAILABLE" },
  checkoutCount: { type: Number, default: 0 },
  waitlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }],
  coverImage: { type: String, default: "" }
});

export default mongoose.model("Book", bookSchema);
