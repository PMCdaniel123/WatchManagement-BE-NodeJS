const express = require("express");
const router = express.Router();
const { handleRegister } = require("../controllers/registerController");
const { handleLogin } = require("../controllers/loginController");
const { handleRefreshToken } = require("../controllers/refreshController");
// Register
router.post("/register", handleRegister);
// Login
router.post("/login", handleLogin);
// Refresh token
router.put("/refresh", handleRefreshToken);

module.exports = router;
