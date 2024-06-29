const Member = require("../models/Member");
const validate = require("../utils/validate");

exports.getMemberProfile = async (req, res) => {
  const { _id, membername, name, YOB } = await req.member;
  return res.json({
    data: {
      id: _id,
      membername: membername,
      name: name,
      YOB: YOB,
    },
  });
};

exports.updateMemberProfile = async (req, res) => {
  const { name, YOB } = req.body;
  try {
    const member = await Member.findByIdAndUpdate(req.member._id);
    if (name) member.name = name;
    if (YOB) member.YOB = YOB;
    member.save();
    return res.status(201).json({
      data: {
        profile: {
          name: name,
          YOB: YOB,
        },
      },
      message: "Profile updated successfully",
    });
  } catch (err) {
    return res.status(400).json({ message: err.message, error: "Bad Request" });
  }
};

exports.getAllMembers = async (_, res) => {
  try {
    const members = await Member.find({});
    return res.json({
      data: {
        members: members,
      },
    });
  } catch (err) {
    return res.status(400).json({ message: err.message, error: "Bad Request" });
  }
};

exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  try {
    const member = await Member.findById(req.member._id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    const isMatch = await member.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid current password" });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }
    if (!validate.regexPwd.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must contain at least one special character, one number, one letter, and be at least 6 characters long",
      });
    }
    // Upate pwd prev and new pwd
    member.previousPassword = member.password;
    member.password = newPassword;
    await member.save();

    return res.status(201).json({
      data: { currentPassword: currentPassword, newPassword: newPassword },
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
