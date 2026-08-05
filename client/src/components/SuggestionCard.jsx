function SuggestionCard({ suggestion }) {
  return (
    <article className="suggestion-card">
      <h3>{suggestion.title}</h3>
      <p>{suggestion.description}</p>
      <span className="category-tag">{suggestion.category}</span>
    </article>
  );
}

export default SuggestionCard;
