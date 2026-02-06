import Member from "../models/Member.js";

export const addMember = async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.json(member);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getMembers = async (req, res) => {
  try {
    const members = await Member.find().populate({
      path: "activeLoans",
      populate: { path: "book", select: "title" }
    });

    res.json(members);
  } catch (err) {
    res.status(500).json(err);
  }
};
