import { useEffect, useState } from "react";
import Branding from "../components/Branding";
import CategoryFilter from "../components/CategoryFilter";
import SuggestionsHeader from "../components/SuggestionsHeader";
import SuggestionCard from "../components/SuggestionCard";
import EmptyState from "../components/EmptyState";
import { getAllSuggestions, getSuggestionsByCategory } from "../api";

function HomePage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    const load = async () => {
      try {
        const data =
          activeFilter === "All"
            ? await getAllSuggestions()
            : await getSuggestionsByCategory(activeFilter);
        if (!cancelled) setSuggestions(data);
      } catch {
        if (!cancelled) setError("Something went wrong loading feedback. Please try again.");
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeFilter]);

  return (
    <div className="page page--home">
      <aside className="sidebar">
        <Branding />
        <CategoryFilter activeFilter={activeFilter} onSelect={setActiveFilter} />
      </aside>

      <main className="main-content">
        <SuggestionsHeader count={suggestions.length} />

        {error && <p className="error-message">{error}</p>}

        {!error && suggestions.length === 0 && <EmptyState />}

        {!error && suggestions.length > 0 && (
          <div className="suggestion-list">
            {suggestions.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default HomePage;
