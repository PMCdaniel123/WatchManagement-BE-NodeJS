const jwt = require("jsonwebtoken");
const Member = require("../models/Member");
const secretKey = process.env.JWT_SECRET;
const refreshSecretKey = process.env.JWT_REFRESH_SECRET;

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, no token", error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.member = await Member.findById(decoded.id).select("-password");
    if (!req.member) {
      return res
        .status(401)
        .json({ message: "Member not found", error: "Unauthorized" });
    }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const refreshToken = req.body.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({
          message: "Refresh token is required",
          error: "Unauthorized",
        });
      }

      try {
        const decoded = jwt.verify(refreshToken, refreshSecretKey);
        const member = await Member.findById(decoded.id);
        if (!member) {
          return res
            .status(404)
            .json({ message: "Member not found", error: "Not Found" });
        }

        if (member.refreshToken !== refreshToken) {
          return res
            .status(403)
            .json({ message: "Invalid refresh token", error: "Forbidden" });
        }

        const newAccessToken = jwt.sign({ id: member._id }, secretKey, {
          expiresIn: "1h",
        });

        // Optionally update the refresh token as well
        const newRefreshToken = jwt.sign({ id: member._id }, refreshSecretKey, {
          expiresIn: "7d",
        });

        member.refreshToken = newRefreshToken;
        await member.save();

        res.setHeader("authorization", `Bearer ${newAccessToken}`);
        res.setHeader("refreshToken", newRefreshToken);
        req.member = member;
        next();
      } catch (error) {
        return res.status(401).json({
          message: "Invalid or expired refresh token",
          error: "Unauthorized",
        });
      }
    } else {
      return res.status(401).json({
        message: "Not authorized, token failed",
        error: "Unauthorized",
      });
    }
  }
};

const admin = (req, res, next) => {
  if (req.member && req.member.isAdmin) {
    next();
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized as an admin", error: "Unauthorized" });
  }
};

module.exports = { protect, admin };
