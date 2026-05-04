const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
require("./config/db");

const http = require("http");
const { Server } = require("socket.io");

// =======================
// ROUTES
// =======================
const userRoutes = require("./routes/userRoutes");
const comboRoutes = require("./routes/comboRoutes");
const eventRoutes = require("./routes/eventRoutes");
const comboMemberRoutes = require("./routes/comboMemberRoutes");
const messagesRoutes = require("./routes/messagesRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// =======================
// SERVER
// =======================
const server = http.createServer(app);

// =======================
// SOCKET.IO
// =======================
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Usuario conectado:", socket.id);

  socket.on("joinCombo", (comboId) => {
    const room = `combo_${comboId}`;
    socket.join(room);
  });

  socket.on("sendMessage", (data) => {
    if (!data.combo_id) return;

    const room = `combo_${data.combo_id}`;
    io.to(room).emit("newMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Usuario desconectado:", socket.id);
  });
});

// =======================
// MIDDLEWARES
// =======================
app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());

// 🔥 SOLO MULTER (NO fileUpload)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// =======================
// ROUTES
// =======================
app.use("/api/auth", userRoutes);
app.use("/api/combos", comboRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/combo-members", comboMemberRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/upload", uploadRoutes);

// =======================
// HEALTH CHECK
// =======================
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API Vibra funcionando correctamente",
  });
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
