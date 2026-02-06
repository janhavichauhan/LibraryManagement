import Member from "../models/Member.js";

export const addMember = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const newMember = await Member.create({ firstName, lastName });
    res.status(201).json(newMember);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getMembers = async (req, res) => {
  try {
    const members = await Member.find()
      .populate({
        path: 'activeLoans',      
        populate: { path: 'book' } 
      });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const member = await Member.findById(memberId);
    
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    
    if (member.activeLoans && member.activeLoans.length > 0) {
      return res.status(400).json({ message: "Cannot delete member with active loans" });
    }
    
    await Member.findByIdAndDelete(memberId);
    res.json({ message: "Member deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};