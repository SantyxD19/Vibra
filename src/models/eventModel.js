const pool = require("../config/db");

// =======================
// 📥 OBTENER EVENTOS (SOLO ACTIVOS)
// =======================
const getAllEvents = async () => {
  const result = await pool.query(
    "SELECT * FROM events WHERE status = 'active' ORDER BY date ASC",
  );
  return result.rows;
};

// =======================
// 📸 CREAR EVENTO
// =======================
const createEvent = async (name, location, city, date, image_url) => {
  const query = `
    INSERT INTO events (name, location, city, date, image_url, status)
    VALUES ($1, $2, $3, $4, $5, 'active')
    RETURNING *;
  `;

  const values = [name, location, city, date, image_url];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// =======================
// ✏️ ACTUALIZAR EVENTO
// =======================
const updateEvent = async (id, name, location, city, date, image_url) => {
  const query = `
    UPDATE events
    SET
      name = $1,
      location = $2,
      city = $3,
      date = $4,
      image_url = COALESCE($5, image_url)
    WHERE id = $6
    RETURNING *;
  `;

  const values = [name, location, city, date, image_url, id];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// =======================
// 🏁 FINALIZAR EVENTO (🔥 NUEVO)
// =======================
const finishEvent = async (id) => {
  const query = `
    UPDATE events
    SET status = 'finished'
    WHERE id = $1
    RETURNING *;
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// =======================
// 🗑 ELIMINAR EVENTO (opcional dejarlo)
// =======================
const deleteEvent = async (id) => {
  const query = `
    DELETE FROM events
    WHERE id = $1
    RETURNING *;
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  finishEvent, // 👈 IMPORTANTE
};
