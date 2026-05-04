const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");
const upload = require("../middlewares/upload");

// =======================
// 🌍 PUBLICO
// =======================

router.get("/", eventController.getEvents);

// =======================
// ➕ CREAR EVENTO (TEMP SIN AUTH)
// =======================
router.post("/", upload.single("image"), eventController.createEvent);

// =======================
// ✏️ UPDATE EVENT (TEMP SIN AUTH)
// =======================
router.put("/:id", upload.single("image"), eventController.updateEvent);

// =======================
// 🏁 FINISH
// =======================
router.put("/:id/finish", eventController.finishEvent);

// =======================
// 🗑 DELETE
// =======================
router.delete("/:id", eventController.deleteEvent);

module.exports = router;
