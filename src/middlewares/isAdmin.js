const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado (admin only)" });
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: "Error de permisos" });
  }
};

module.exports = isAdmin;
