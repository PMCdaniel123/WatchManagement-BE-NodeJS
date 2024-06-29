const jwt = require("jsonwebtoken");
const Member = require("../models/Member");

exports.handleRefreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res
      .status(400)
      .json({ message: "Refresh token is required", error: "Bad Request" });
  }

  try {
    const member = await Member.findOne({ refreshToken });
    if (!member) {
      return res
        .status(404)
        .json({ message: "Member not found", error: "Not Found" });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          member.refreshToken = null;
          await member.save();

          return res.status(401).json({
            message: "Invalid or expired refresh token",
            error: "Unauthorized",
          });
        }

        if (member._id.toString() !== decoded.id) {
          return res.status(403).json({
            message: "Forbidden: Refresh token does not match",
            error: "Forbidden",
          });
        }

        const newAccessToken = jwt.sign(
          { id: member._id },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          },
        );
        const newRefreshToken = jwt.sign(
          { id: member._id },
          process.env.JWT_REFRESH_SECRET,
          {
            expiresIn: "7d",
          },
        );

        member.refreshToken = newRefreshToken;
        await member.save();

        return res.status(201).json({
          data: {
            token: newAccessToken,
            refreshToken: newRefreshToken,
          },
          message: "Token refreshed successfully",
        });
      },
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
