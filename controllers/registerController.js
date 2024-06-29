const Member = require("../models/Member");
const validate = require("../utils/validate");

exports.handleRegister = async (req, res) => {
  const { membername, password, name, YOB } = req.body;
  try {
    // Reject membername is "admin"
    if (membername.toLowerCase() === "admin") {
      return res.status(400).json({
        message: "Member name cannot be 'admin'",
        error: "Bad Request",
      });
    }

    // Check if membername already exists
    const existingMember = await Member.findOne({ membername });
    if (existingMember) {
      return res
        .status(403)
        .json({ message: "Member name already exists", error: "Forbidden" });
    }

    // Validate password
    if (!validate.regexPwd.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least one special character, one number, one letter, and be at least 6 characters long",
        error: "Bad Request",
      });
    }

    // Create and save the new member
    const member = new Member({ membername, password, name, YOB });
    await member.save();

    return res.status(201).json({
      data: member,
      message: "Member registered",
    });
  } catch (err) {
    if (!res.headersSent) {
      res.status(400).json({ message: err.message, error: "Bad Request" });
    }
  }
};
