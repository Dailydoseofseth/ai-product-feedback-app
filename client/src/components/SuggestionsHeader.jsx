import { Link } from "react-router-dom";

function SuggestionsHeader({ count }) {
  return (
    <div className="suggestions-header">
      <h2 className="suggestions-header__count">
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M10 2a6 6 0 0 0-3 11.2V15a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1.8A6 6 0 0 0 10 2Z"
            fill="#F49F85"
          />
          <rect x="8" y="17" width="4" height="1.5" rx="0.75" fill="#F49F85" />
        </svg>
        {count} Suggestion{count === 1 ? "" : "s"}
      </h2>
      <Link to="/add-feedback" className="btn btn--add-feedback">
        + Add Feedback
      </Link>
    </div>
  );
}

export default SuggestionsHeader;
