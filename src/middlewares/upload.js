const multer = require("multer");

// 🚀 IMPORTANTE: memoria, no disco
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB opcional
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo imágenes permitidas"));
    }
    cb(null, true);
  },
});

module.exports = upload;
