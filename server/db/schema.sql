CREATE TABLE IF NOT EXISTS suggestions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('UI', 'UX', 'Enhancement', 'Bug', 'Feature')),
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
