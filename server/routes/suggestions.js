const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

const CATEGORIES = ["UI", "UX", "Enhancement", "Bug", "Feature"];

function sanitizeText(input) {
  // Strip control/null characters only - the frontend never renders this
  // text as HTML (React escapes it on output), so stripping < > here would
  // just corrupt legitimate content like "5 < 10 and 10 > 5" for no real
  // security benefit.
  return typeof input === "string"
    ? input.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "").trim()
    : "";
}

router.get("/get-all-suggestions", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM suggestions ORDER BY created_at DESC"
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

router.get("/get-suggestions-by-category/:category", async (req, res) => {
  const { category } = req.params;

  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    const { rows } = await pool.query(
      "SELECT * FROM suggestions WHERE category = $1 ORDER BY created_at DESC",
      [category]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

router.post("/add-one-suggestion", async (req, res) => {
  const { title, category, description } = req.body || {};

  const trimmedTitle = sanitizeText(title);
  const trimmedDescription = sanitizeText(description);

  if (trimmedTitle.length === 0) {
    return res.status(400).json({ error: "Can't be empty" });
  }

  if (trimmedTitle.length < 2 || trimmedTitle.length > 100) {
    return res
      .status(400)
      .json({ error: "Title must be between 2 and 100 characters" });
  }

  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Please select a category" });
  }

  if (trimmedDescription.length === 0) {
    return res.status(400).json({ error: "Can't be empty" });
  }

  if (trimmedDescription.length < 10 || trimmedDescription.length > 500) {
    return res
      .status(400)
      .json({ error: "Description must be between 10 and 500 characters" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO suggestions (title, category, description) VALUES ($1, $2, $3) RETURNING *",
      [trimmedTitle, category, trimmedDescription]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create suggestion" });
  }
});

module.exports = router;
