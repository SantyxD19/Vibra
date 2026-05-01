const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const verifyToken = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

// =======================
// 🔥 AUTH PUBLICO
// =======================

// REGISTER
router.post("/register", upload.single("image"), userController.register);

// LOGIN NORMAL
router.post("/login", userController.loginUser);

// 🔵 GOOGLE LOGIN
router.post("/google", userController.googleLogin);

// 🔐 FORGOT PASSWORD
router.post("/forgot-password", userController.forgotPassword);

// 🔐 RESET PASSWORD
router.post("/reset-password/:token", userController.resetPassword);

// =======================
// 👤 PERFIL (PROTEGIDO)
// =======================

// GET PROFILE
router.get("/profile", verifyToken, userController.getProfile);

// UPDATE PROFILE
router.put("/profile", verifyToken, userController.updateProfile);

module.exports = router;
