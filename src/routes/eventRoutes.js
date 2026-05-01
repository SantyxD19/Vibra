const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");
const verifyToken = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");
const upload = require("../middlewares/upload");

// =======================
// 🌍 PUBLICO
// =======================

// 🔥 VER EVENTOS (solo activos)
router.get("/", eventController.getEvents);

// =======================
// 🔥 ADMIN ONLY
// =======================

// ➕ CREAR EVENTO
router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.single("image"),
  eventController.createEvent,
);

// ✏️ EDITAR EVENTO
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.single("image"),
  eventController.updateEvent,
);

// 🏁 FINALIZAR EVENTO (🔥 NUEVO)
router.put("/:id/finish", verifyToken, isAdmin, eventController.finishEvent);

// 🗑 ELIMINAR EVENTO (opcional dejarlo)
router.delete("/:id", verifyToken, isAdmin, eventController.deleteEvent);

module.exports = router;
