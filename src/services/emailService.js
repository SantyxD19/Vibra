const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =======================
// 📩 VERIFICACIÓN
// =======================
const sendVerificationEmail = async (email, code) => {
  await transporter.sendMail({
    from: `"Vibra App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Código de verificación",
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Verifica tu cuenta</h2>
        <p>Tu código de verificación es:</p>
        <h1 style="color:#6d28d9">${code}</h1>
        <p>Este código expira en 10 minutos.</p>
      </div>
    `,
  });
};

// =======================
// 🔐 RESET PASSWORD
// =======================
const sendResetPasswordEmail = async (email, token) => {
  const resetLink = `http://localhost:5173/reset-password/${token}`;

  await transporter.sendMail({
    from: `"Vibra App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Recupera tu contraseña",
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Recuperación de contraseña 🔐</h2>
        <p>Haz clic en el siguiente botón para cambiar tu contraseña:</p>

        <a href="${resetLink}" 
           style="
             display:inline-block;
             padding:12px 20px;
             background:#6d28d9;
             color:white;
             text-decoration:none;
             border-radius:8px;
             margin-top:10px;
           ">
           Cambiar contraseña
        </a>

        <p style="margin-top:20px;">
          Este enlace expira en 10 minutos.
        </p>

        <p style="color:gray; font-size:12px;">
          Si no solicitaste este cambio, ignora este mensaje.
        </p>
      </div>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail, // 🔥 IMPORTANTE
};
