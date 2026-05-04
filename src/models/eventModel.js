const pool = require("../config/db");

// =======================
// 📥 OBTENER EVENTOS
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

  const values = [
    name ?? null,
    location ?? null,
    city ?? null,
    date ?? null,
    image_url ?? null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// =======================
// ✏️ UPDATE EVENT (🔥 FIX DEFINITIVO)
// =======================
const updateEvent = async (id, name, location, city, date, image_url) => {
  const query = `
    UPDATE events
    SET
      name = COALESCE($1, name),
      location = COALESCE($2, location),
      city = COALESCE($3, city),
      date = COALESCE($4, date),
      image_url = COALESCE($5, image_url)
    WHERE id = $6
    RETURNING *;
  `;

  const values = [
    name ?? null,
    location ?? null,
    city ?? null,
    date ?? null,
    image_url ?? null,
    id,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// =======================
// 🏁 FINALIZAR EVENTO
// =======================
const finishEvent = async (id) => {
  const result = await pool.query(
    `
    UPDATE events
    SET status = 'finished'
    WHERE id = $1
    RETURNING *;
    `,
    [id],
  );

  return result.rows[0];
};

// =======================
// 🗑 ELIMINAR EVENTO
// =======================
const deleteEvent = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM events
    WHERE id = $1
    RETURNING *;
    `,
    [id],
  );

  return result.rows[0];
};

module.exports = {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  finishEvent,
};
