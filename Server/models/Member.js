import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  activeLoans: [{ type: mongoose.Schema.Types.ObjectId, ref: "Loan" }]
});

export default mongoose.model("Member", memberSchema);
