const { Pool } = require("pg");
require("dotenv").config();

// 🔍 DEBUG seguro (no expone password completa)
console.log(
  "🔗 DATABASE_URL cargada:",
  process.env.DATABASE_URL ? "OK" : "❌ NO CARGA",
);

// 🚨 Validación fuerte
if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL no está definida en .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// 🔥 Conexión con mejor debug
pool
  .connect()
  .then((client) => {
    console.log("✅ Conectado a Supabase correctamente");
    client.release(); // libera conexión
  })
  .catch((err) => {
    console.error("❌ ERROR CONECTANDO DB:");
    console.error(err.message); // más limpio
    console.error("💡 Revisa password, URL o proyecto Supabase");
  });

module.exports = pool;
