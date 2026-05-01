const pool = require("../config/db");

// =======================
// 👤 CREAR USUARIO
// =======================
const createUser = async (
  name,
  email,
  password,
  image = null,
  verificationCode,
  expiresAt,
) => {
  const result = await pool.query(
    `
    INSERT INTO users (
      name,
      email,
      password,
      image,
      role,
      is_verified,
      verification_code,
      verification_expires
    )
    VALUES ($1, $2, $3, $4, 'user', false, $5, $6)
    RETURNING *;
    `,
    [name, email, password, image, verificationCode, expiresAt],
  );

  return result.rows[0];
};

// =======================
// 👤 GET USER BY EMAIL
// =======================
const getUserByEmail = async (email) => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);

  return result.rows[0];
};

// =======================
// 🔐 SAVE RESET TOKEN (🔥 CORREGIDO → usa ID)
// =======================
const saveResetToken = async (userId, token, expires) => {
  console.log("💾 GUARDANDO TOKEN PARA USER:", userId);

  const result = await pool.query(
    `
    UPDATE users
    SET reset_token = $1,
        reset_expires = $2
    WHERE id = $3
    RETURNING *;
    `,
    [token, expires, userId],
  );

  console.log("💾 RESULT DB:", result.rows[0]);

  return result.rows[0];
};
// =======================
// 🔍 GET USER BY TOKEN
// =======================
const getUserByResetToken = async (token) => {
  const result = await pool.query(
    `
    SELECT * FROM users
    WHERE reset_token = $1
    `,
    [token],
  );

  return result.rows[0];
};

// =======================
// 🔑 UPDATE PASSWORD
// =======================
const updatePassword = async (userId, hashedPassword) => {
  const result = await pool.query(
    `
    UPDATE users
    SET password = $1,
        reset_token = NULL,
        reset_expires = NULL
    WHERE id = $2
    RETURNING *;
    `,
    [hashedPassword, userId],
  );

  return result.rows[0];
};

// =======================
// 👤 PERFIL
// =======================

// CREAR PERFIL
const createUserProfile = async (userId) => {
  const result = await pool.query(
    `
    INSERT INTO user_profile (user_id, bio, music_preferences, created_at)
    VALUES ($1, '', '[]', NOW())
    RETURNING *;
    `,
    [userId],
  );

  return result.rows[0];
};

// OBTENER PERFIL
const getUserProfile = async (userId) => {
  const result = await pool.query(
    `
    SELECT * FROM user_profile WHERE user_id = $1
    `,
    [userId],
  );

  return result.rows[0];
};

// ACTUALIZAR PERFIL
const updateUserProfile = async (userId, bio, music_preferences) => {
  const result = await pool.query(
    `
    UPDATE user_profile
    SET bio = $1,
        music_preferences = $2,
        updated_at = NOW()
    WHERE user_id = $3
    RETURNING *;
    `,
    [bio, JSON.stringify(music_preferences), userId],
  );

  return result.rows[0];
};

// =======================
// EXPORTS
// =======================
module.exports = {
  createUser,
  getUserByEmail,

  // 🔐 RESET PASSWORD
  saveResetToken,
  getUserByResetToken,
  updatePassword,

  // 👤 PERFIL
  createUserProfile,
  getUserProfile,
  updateUserProfile,
};
