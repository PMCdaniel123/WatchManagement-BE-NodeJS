const Member = require("../models/Member");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.handleLogin = async (req, res) => {
  const { membername, password } = req.body;
  try {
    const member = await Member.findOne({ membername });
    if (!member) {
      return res.status(404).json({
        message: "Username or password is incorrect",
        error: "Not Found",
      });
    }
    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Username or password is incorrect",
        error: "Not Found",
      });
    }
    const accessToken = jwt.sign({ id: member._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { id: member._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );
    // Optionally save the refresh token in the database
    member.accessToken = accessToken;
    member.refreshToken = refreshToken;
    await member.save();
    const data = {
      token: accessToken,
      refreshToken: refreshToken,
      admin: member.isAdmin,
    };
    return res.json({ data: data, message: "Login successfully" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message, error: "Bad Request" });
  }
};
