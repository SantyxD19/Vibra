const comboModel = require("../models/comboModel");

// 🔥 Crear combo
const createCombo = async (req, res) => {
  try {
    const { event_id, max_members, zona, description } = req.body;
    const creator_id = req.user.id;

    const combo = await comboModel.createCombo(
      event_id,
      creator_id,
      max_members,
      zona,
      description,
    );

    res.status(201).json(combo);
  } catch (error) {
    console.error("createCombo:", error);
    res.status(500).json({ error: "Error creando combo" });
  }
};

// 🔥 Obtener combos por evento
const getCombosByEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // 👇 IMPORTANTE: ya tienes verifyToken, así que siempre existe
    const user_id = req.user.id;

    const combos = await comboModel.getCombosByEvent(id, user_id);
    res.json(combos);
  } catch (error) {
    console.error("getCombosByEvent:", error);
    res.status(500).json({ error: "Error obteniendo combos" });
  }
};

// 🔥 Obtener MIS combos
const getMyCombos = async (req, res) => {
  try {
    const user_id = req.user.id;

    const combos = await comboModel.getMyCombos(user_id);

    res.json(combos);
  } catch (error) {
    console.error("getMyCombos:", error);
    res.status(500).json({ error: "Error obteniendo tus combos" });
  }
};

// 🔥 Unirse a combo
const joinCombo = async (req, res) => {
  try {
    const { combo_id } = req.body;
    const user_id = req.user.id;

    const result = await comboModel.joinCombo(combo_id, user_id);

    res.json({
      message: "Te uniste al combo",
      data: result,
    });
  } catch (error) {
    console.error("joinCombo:", error);
    res.status(400).json({ error: error.message });
  }
};

// 🔥 Salir del combo
const leaveCombo = async (req, res) => {
  try {
    const { combo_id } = req.body;
    const user_id = req.user.id;

    const result = await comboModel.leaveCombo(combo_id, user_id);

    res.json({
      message: "Saliste del combo",
      data: result,
    });
  } catch (error) {
    console.error("leaveCombo:", error);
    res.status(400).json({ error: error.message });
  }
};

// 🔥 Ver miembros
const getMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const members = await comboModel.getComboMembers(id);

    res.json(members);
  } catch (error) {
    console.error("getMembers:", error);
    res.status(500).json({ error: "Error obteniendo miembros" });
  }
};

module.exports = {
  createCombo,
  getCombosByEvent,
  getMyCombos, // 👈 clave para MyCombos
  joinCombo,
  leaveCombo,
  getMembers,
};
