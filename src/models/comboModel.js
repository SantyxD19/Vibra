const pool = require("../config/db");

// 🔥 Crear combo
const createCombo = async (
  event_id,
  creator_id,
  max_members,
  zona,
  description,
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 🔥 Crear combo
    const comboResult = await client.query(
      `INSERT INTO combos (event_id, creator_id, max_members, zona, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [event_id, creator_id, max_members, zona, description],
    );

    const combo = comboResult.rows[0];

    // 🔥 AUTO JOIN (el creador entra)
    await client.query(
      `INSERT INTO combo_members (combo_id, user_id)
       VALUES ($1, $2);`,
      [combo.id, creator_id],
    );

    await client.query("COMMIT");

    return combo;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// 🔥 Obtener combos por evento
const getCombosByEvent = async (event_id, user_id) => {
  const query = `
    SELECT 
      c.*,
      COUNT(cm.id) AS members_count,
      MAX(CASE WHEN cm.user_id = $2 THEN 1 ELSE 0 END) AS is_member
    FROM combos c
    LEFT JOIN combo_members cm ON cm.combo_id = c.id
    WHERE c.event_id = $1
    GROUP BY c.id
    ORDER BY c.id;
  `;

  const result = await pool.query(query, [event_id, user_id]);
  return result.rows;
};

// 🔥 NUEVO: Mis combos (🔥 LO QUE TE FALTABA)
const getMyCombos = async (user_id) => {
  const query = `
    SELECT 
      c.*,
      e.name AS event_name,
      COUNT(cm.id) AS members_count
    FROM combos c
    JOIN combo_members cm ON cm.combo_id = c.id
    JOIN events e ON e.id = c.event_id
    WHERE cm.user_id = $1
    GROUP BY c.id, e.name
    ORDER BY c.id DESC;
  `;

  const result = await pool.query(query, [user_id]);
  return result.rows;
};

// 🔥 Unirse
const joinCombo = async (combo_id, user_id) => {
  const check = await pool.query(
    "SELECT * FROM combo_members WHERE combo_id = $1 AND user_id = $2",
    [combo_id, user_id],
  );

  if (check.rows.length > 0) {
    throw new Error("Ya estás en este combo");
  }

  const count = await pool.query(
    "SELECT COUNT(*) FROM combo_members WHERE combo_id = $1",
    [combo_id],
  );

  const current = parseInt(count.rows[0].count);

  const combo = await pool.query(
    "SELECT max_members FROM combos WHERE id = $1",
    [combo_id],
  );

  const max = combo.rows[0].max_members;

  if (current >= max) {
    throw new Error("El combo está lleno");
  }

  const result = await pool.query(
    "INSERT INTO combo_members (combo_id, user_id) VALUES ($1, $2) RETURNING *",
    [combo_id, user_id],
  );

  return result.rows[0];
};

// 🔥 Salir
const leaveCombo = async (combo_id, user_id) => {
  const result = await pool.query(
    "DELETE FROM combo_members WHERE combo_id = $1 AND user_id = $2 RETURNING *",
    [combo_id, user_id],
  );

  if (result.rows.length === 0) {
    throw new Error("No estás en este combo");
  }

  return result.rows[0];
};

// 🔥 Miembros
const getComboMembers = async (combo_id) => {
  const query = `
    SELECT u.id, u.name, u.email
    FROM combo_members cm
    JOIN users u ON u.id = cm.user_id
    WHERE cm.combo_id = $1;
  `;

  const result = await pool.query(query, [combo_id]);
  return result.rows;
};

module.exports = {
  createCombo,
  getCombosByEvent,
  getMyCombos, // 👈 IMPORTANTE
  joinCombo,
  leaveCombo,
  getComboMembers,
};
