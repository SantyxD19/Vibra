const express = require("express");
const router = express.Router();

const {
  createCombo,
  getCombosByEvent,
  getMyCombos,
  joinCombo,
  leaveCombo,
  getMembers,
} = require("../controllers/comboController");

const authMiddleware = require("../middlewares/authMiddleware");

// 🔥 RUTAS ESPECÍFICAS PRIMERO

// 👉 MIS COMBOS
router.get("/my", authMiddleware, getMyCombos);

// 👉 COMBOS POR EVENTO
router.get("/event/:id", authMiddleware, getCombosByEvent);

// 👉 MIEMBROS
router.get("/:id/members", getMembers);

// 👉 ACCIONES
router.post("/create", authMiddleware, createCombo);
router.post("/join", authMiddleware, joinCombo);
router.post("/leave", authMiddleware, leaveCombo);

module.exports = router;
