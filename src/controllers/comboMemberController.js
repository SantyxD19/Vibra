const comboMemberModel = require("../models/comboMemberModel");
const pool = require("../config/db");

const joinCombo = async (req, res) => {
  try {
    const { combo_id } = req.body;
    const user_id = req.user.id;

    if (!combo_id) {
      return res.status(400).json({ error: "Falta combo_id" });
    }

    // 🔍 1. Obtener capacidad del combo
    const comboResult = await pool.query(
      "SELECT max_members FROM combos WHERE id = $1",
      [combo_id],
    );

    if (comboResult.rows.length === 0) {
      return res.status(404).json({ error: "Combo no existe" });
    }

    const maxMembers = comboResult.rows[0].max_members;

    // 🔍 2. Contar miembros actuales
    const membersResult = await pool.query(
      "SELECT COUNT(*) FROM combo_members WHERE combo_id = $1",
      [combo_id],
    );

    const currentMembers = parseInt(membersResult.rows[0].count);

    // 🚫 3. Validar cupo
    if (currentMembers >= maxMembers) {
      return res.status(400).json({ error: "El combo está lleno" });
    }

    // ✅ 4. Insertar
    const result = await comboMemberModel.joinCombo(combo_id, user_id);

    res.status(201).json(result);
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(400).json({ error: "Ya estás en este combo" });
    }

    res.status(500).json({ error: "Error uniéndose al combo" });
  }
};

module.exports = { joinCombo };
