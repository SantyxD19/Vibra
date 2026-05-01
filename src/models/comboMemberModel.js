const pool = require("../config/db");

const joinCombo = async (combo_id, user_id) => {
  const query = `
    INSERT INTO combo_members (combo_id, user_id)
    VALUES ($1, $2)
    RETURNING *;
  `;

  const result = await pool.query(query, [combo_id, user_id]);
  return result.rows[0];
};

module.exports = { joinCombo };
