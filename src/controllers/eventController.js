const eventModel = require("../models/eventModel");

// =======================
// 📥 GET EVENTS
// =======================
const getEvents = async (req, res) => {
  try {
    const events = await eventModel.getAllEvents();
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo eventos" });
  }
};

// =======================
// 📸 CREATE EVENT (ADMIN)
// =======================
const createEvent = async (req, res) => {
  try {
    const { name, location, city, date } = req.body;

    if (!name || !location || !city || !date) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const newEvent = await eventModel.createEvent(
      name,
      location,
      city,
      date,
      image_url,
    );

    res.status(201).json(newEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando evento" });
  }
};

// =======================
// ✏️ UPDATE EVENT (ADMIN)
// =======================
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, city, date } = req.body;

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const updated = await eventModel.updateEvent(
      id,
      name,
      location,
      city,
      date,
      image_url,
    );

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error actualizando evento" });
  }
};

// =======================
// 🏁 FINALIZAR EVENTO (🔥 NUEVO)
// =======================
const finishEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await eventModel.finishEvent(id);

    if (!updated) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    res.json({
      message: "Evento finalizado",
      event: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error finalizando evento" });
  }
};

// =======================
// 🗑 DELETE EVENT (opcional)
// =======================
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await eventModel.deleteEvent(id);

    res.json({
      message: "Evento eliminado",
      event: deleted,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error eliminando evento" });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  finishEvent, // 👈 IMPORTANTE
};
