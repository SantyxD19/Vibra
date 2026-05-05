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
// 📸 CREATE EVENT (SUPABASE FIXED)
// =======================
const createEvent = async (req, res) => {
  try {
    console.log("🔥 CREATE EVENT HIT");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { name, location, city, date } = req.body;

    if (!name || !location || !city || !date) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    // 🔥 SUBIDA A SUPABASE STORAGE
    let image_url = null;

    if (req.file) {
      image_url = await uploadImage(req.file);
    }

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
// ✏️ UPDATE EVENT (SUPABASE FIXED)
// =======================
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    let image_url = null;

    if (req.file) {
      image_url = await uploadImage(req.file);
    }

    const updated = await eventModel.updateEvent(
      id,
      req.body.name,
      req.body.location,
      req.body.city,
      req.body.date,
      image_url,
    );

    res.json(updated);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ error: "Error actualizando evento" });
  }
};

// =======================
const finishEvent = async (req, res) => {
  try {
    const updated = await eventModel.finishEvent(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Error finalizando evento" });
  }
};

// =======================
const deleteEvent = async (req, res) => {
  try {
    const deleted = await eventModel.deleteEvent(req.params.id);
    res.json(deleted);
  } catch (error) {
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
