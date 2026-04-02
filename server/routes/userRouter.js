const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  enableAccessMode,
  switchMode,
} = require("../controllers/auth");

const { decodeToken } = require("../middleware/authmiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", decodeToken, getProfile);
router.patch("/enable-access", decodeToken, enableAccessMode);
router.patch("/switch-mode", decodeToken, switchMode);

module.exports = router;