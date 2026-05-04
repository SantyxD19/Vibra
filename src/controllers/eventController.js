const eventModel = require("../models/eventModel");
const uploadImage = require("../utils/uploadImage");

// =======================
// 📥 GET EVENTS
// =======================
const getEvents = async (req, res) => {
  try {
    const events = await eventModel.getAllEvents();
    res.json(events);
  } catch (error) {
    console.error("GET EVENTS ERROR:", error);
    res.status(500).json({ error: "Error obteniendo eventos" });
  }
};

// =======================
// 📸 CREATE EVENT (SUPABASE)
// =======================
const createEvent = async (req, res) => {
  try {
    const { name, location, city, date } = req.body;

    if (!name || !location || !city || !date) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    // 🔥 SUBIDA A SUPABASE STORAGE
    const image_url = await uploadImage(req.file);

    const newEvent = await eventModel.createEvent(
      name,
      location,
      city,
      date,
      image_url,
    );

    res.status(201).json(newEvent);
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    res.status(500).json({ error: "Error creando evento" });
  }
};

// =======================
// ✏️ UPDATE EVENT (SUPABASE)
// =======================
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const image_url = await uploadImage(req.file);

    const updated = await eventModel.updateEvent(
      id,
      req.body.name ?? null,
      req.body.location ?? null,
      req.body.city ?? null,
      req.body.date ?? null,
      image_url,
    );

    if (!updated) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    res.json(updated);
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    res.status(500).json({ error: "Error actualizando evento" });
  }
};

// =======================
// 🏁 FINISH EVENT
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
    console.error("FINISH EVENT ERROR:", error);
    res.status(500).json({ error: "Error finalizando evento" });
  }
};

// =======================
// 🗑 DELETE EVENT
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
    console.error("DELETE EVENT ERROR:", error);
    res.status(500).json({ error: "Error eliminando evento" });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  finishEvent,
};
