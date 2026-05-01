const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware.js");

const router = express.Router();

// 🔥 OBTENER MENSAJES
router.get("/:comboId", async (req, res) => {
  try {
    const { comboId } = req.params;

    const result = await db.query(
      `
      SELECT 
        m.id,
        m.content,
        m.created_at,
        m.user_id, -- 🔥 CLAVE
        u.name AS user_name
      FROM messages m
      JOIN users u ON u.id = m.user_id
      WHERE m.combo_id = $1
      ORDER BY m.created_at ASC
      `,
      [comboId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("ERROR GET MESSAGES:", err);
    res.status(500).json({ error: "Error cargando mensajes" });
  }
});

// 🔥 CREAR MENSAJE
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { combo_id, content } = req.body;
    const user_id = req.user.id;

    if (!content) {
      return res.status(400).json({ error: "Mensaje vacío" });
    }

    const insertResult = await db.query(
      `
      INSERT INTO messages (combo_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [combo_id, user_id, content],
    );

    const messageId = insertResult.rows[0].id;

    const messageResult = await db.query(
      `
      SELECT 
        m.id,
        m.content,
        m.created_at,
        m.user_id,
        u.name AS user_name
      FROM messages m
      JOIN users u ON u.id = m.user_id
      WHERE m.id = $1
      `,
      [messageId],
    );

    res.json(messageResult.rows[0]);
  } catch (err) {
    console.error("ERROR POST MESSAGE:", err);
    res.status(500).json({ error: "Error enviando mensaje" });
  }
});

module.exports = router;
