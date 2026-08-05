require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("./pool");

async function migrate() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const seed = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8");

  await pool.query(schema);
  console.log("Schema applied.");

  const { rows } = await pool.query("SELECT COUNT(*) FROM suggestions");
  if (Number(rows[0].count) === 0) {
    await pool.query(seed);
    console.log("Seed data inserted.");
  } else {
    console.log("Suggestions table already has data, skipping seed.");
  }

  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
