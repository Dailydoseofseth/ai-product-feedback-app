import { Link } from "react-router-dom";

function EmptyState() {
  return (
    <div className="empty-state">
      <svg
        className="empty-state__illustration"
        width="100"
        height="100"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle cx="50" cy="46" r="26" fill="#F2F4FF" />
        <path d="M28 34 L50 20 L72 34" fill="#CDD2EE" />
        <circle cx="66" cy="66" r="14" fill="none" stroke="#CDD2EE" strokeWidth="4" />
        <line x1="76" y1="76" x2="88" y2="88" stroke="#CDD2EE" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <h2>There is no feedback yet.</h2>
      <p>
        Got a suggestion? Found a bug that needs to be squashed? We love
        hearing about new ideas to improve our app.
      </p>
      <Link to="/add-feedback" className="btn btn--add-feedback">
        + Add Feedback
      </Link>
    </div>
  );
}

export default EmptyState;
