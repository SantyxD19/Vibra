const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");

const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("../services/emailService");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =======================
// 🔐 VALIDADOR PASSWORD
// =======================
const isValidPassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// =======================
// 🔥 REGISTER
// =======================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        error:
          "La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número",
      });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 VERIFICACIÓN REACTIVADA
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = await userModel.createUser(
      name,
      email,
      hashedPassword,
      image,
      verificationCode,
      expiresAt,
      false, // 🔥 IMPORTANTE: NO verificado
    );

    await userModel.createUserProfile(newUser.id);

    await sendVerificationEmail(email, verificationCode);

    const { password: _, ...safeUser } = newUser;

    res.status(201).json({
      message: "Revisa tu correo para verificar tu cuenta 📩",
      user: safeUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando usuario" });
  }
};
// =======================
// 🔥 LOGIN
// =======================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const user = await userModel.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "Usuario no existe" });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        error: "Debes verificar tu correo primero",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const role = user.email === "santiagomacea19@gmail.com" ? "admin" : "user";

    const token = jwt.sign(
      { id: user.id, email: user.email, role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    const { password: _, ...safeUser } = user;
    safeUser.role = role;

    res.json({
      message: "Login exitoso",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en login" });
  }
};

// =======================
// 🔵 GOOGLE LOGIN
// =======================
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;
    const image = payload.picture;

    let user = await userModel.getUserByEmail(email);

    if (!user) {
      user = await userModel.createUser(name, email, null, image, null, null);
      await userModel.createUserProfile(user.id);
    }

    const role = email === "santiagomacea19@gmail.com" ? "admin" : "user";

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    const { password: _, ...safeUser } = user;
    safeUser.role = role;

    res.json({
      token: jwtToken,
      user: safeUser,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Error login Google" });
  }
};

// =======================
// 🔐 FORGOT PASSWORD
// =======================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email requerido" });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await userModel.getUserByEmail(cleanEmail);

    if (!user) {
      return res.json({
        message: "Si el correo existe, se envió un link 📩",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await userModel.saveResetToken(user.id, token, expires);

    await sendResetPasswordEmail(cleanEmail, token);

    res.json({ message: "Revisa tu correo 📩" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en recuperación" });
  }
};

// =======================
// 🔐 RESET PASSWORD
// =======================
const resetPassword = async (req, res) => {
  try {
    console.log("🔥 REQUEST RESET PASSWORD");

    const { token } = req.params;
    const { password } = req.body;

    console.log("🔐 TOKEN RAW:", token);
    console.log("📦 BODY:", req.body);

    if (!password) {
      return res.status(400).json({
        success: false,
        error: "Contraseña requerida",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        error: "Debe tener mínimo 8 caracteres, una mayúscula y un número",
      });
    }

    const cleanToken = token.trim();

    const user = await userModel.getUserByResetToken(cleanToken);

    console.log("👤 USER FOUND:", user);

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Token inválido o ya fue usado",
      });
    }

    if (!user.reset_expires) {
      return res.status(400).json({
        success: false,
        error: "Token inválido",
      });
    }

    if (new Date() > new Date(user.reset_expires)) {
      return res.status(400).json({
        success: false,
        error: "Token expirado",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.updatePassword(user.id, hashedPassword);

    console.log("✅ PASSWORD UPDATED");

    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada 🔥",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Error reseteando contraseña",
    });
  }
};

// =======================
// 👤 PROFILE
// =======================
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.image,
        p.bio,
        p.music_preferences
      FROM users u
      LEFT JOIN user_profile p ON p.user_id = u.id
      WHERE u.id = $1
      `,
      [userId],
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    user.music_preferences = user.music_preferences || null;
    user.bio = user.bio || "";

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo perfil" });
  }
};

// =======================
// ✏️ UPDATE PROFILE
// =======================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, music_preferences } = req.body;

    const updated = await userModel.updateUserProfile(
      userId,
      bio,
      music_preferences,
    );

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error actualizando perfil" });
  }
};

// =======================
module.exports = {
  register,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
};
