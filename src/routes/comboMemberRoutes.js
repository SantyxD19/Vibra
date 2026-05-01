const express = require("express");
const router = express.Router();

const comboMemberController = require("../controllers/comboMemberController");
const verifyToken = require("../middlewares/authMiddleware");

router.post("/combos/join", verifyToken, comboMemberController.joinCombo);

module.exports = router;
