const { Pool } = require("pg");
require("dotenv").config();

console.log("DB URL:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .connect()
  .then(() => console.log("✅ Conectado a Supabase"))
  .catch((err) => console.error("❌ Error DB:", err));

module.exports = pool;
