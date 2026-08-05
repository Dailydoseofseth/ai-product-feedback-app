const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function getAllSuggestions() {
  const res = await fetch(`${API_URL}/get-all-suggestions`);
  if (!res.ok) throw new Error("Failed to load suggestions");
  return res.json();
}

export async function getSuggestionsByCategory(category) {
  const res = await fetch(`${API_URL}/get-suggestions-by-category/${category}`);
  if (!res.ok) throw new Error("Failed to load suggestions");
  return res.json();
}

export async function addSuggestion({ title, category, description }) {
  const res = await fetch(`${API_URL}/add-one-suggestion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, category, description }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to submit feedback");
  }

  return res.json();
}
