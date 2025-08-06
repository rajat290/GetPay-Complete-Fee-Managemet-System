const Receipt = require("../models/Receipt");

exports.getReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({ student: req.user.id });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching receipts" });
  }
};
