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