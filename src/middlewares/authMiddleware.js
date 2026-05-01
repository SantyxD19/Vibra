const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Token requerido" });
    }

    // 🔥 validar formato Bearer
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Formato de token inválido" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🧠 DEBUG IMPORTANTE (solo mientras arreglamos admin)
    console.log("🔥 TOKEN DECODED:", decoded);

    // 🔥 validación mínima
    if (!decoded?.id) {
      return res.status(401).json({ error: "Token corrupto" });
    }

    req.user = decoded;

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};

module.exports = verifyToken;
