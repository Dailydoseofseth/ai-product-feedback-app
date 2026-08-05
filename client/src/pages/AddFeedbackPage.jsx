import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CATEGORIES } from "../constants";
import { addSuggestion } from "../api";

function validate({ title, description }) {
  const errors = {};
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();

  if (trimmedTitle.length === 0) {
    errors.title = "Can't be empty";
  } else if (trimmedTitle.length < 2 || trimmedTitle.length > 100) {
    errors.title = "Title must be between 2 and 100 characters";
  }

  if (trimmedDescription.length === 0) {
    errors.description = "Can't be empty";
  } else if (trimmedDescription.length < 10 || trimmedDescription.length > 500) {
    errors.description = "Description must be between 10 and 500 characters";
  }

  return errors;
}

function AddFeedbackPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Feature");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate({ title, description });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await addSuggestion({ title: title.trim(), category, description: description.trim() });
      navigate("/");
    } catch {
      setSubmitError("Couldn't submit your feedback. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="page page--add-feedback">
      <Link to="/" className="go-back">
        &lsaquo; Go Back
      </Link>

      <form className="feedback-form" onSubmit={handleSubmit} noValidate>
        <div className="feedback-form__icon" aria-hidden="true">
          +
        </div>
        <h1>Create New Feedback</h1>

        <div className="form-field">
          <label htmlFor="title">Feedback Title</label>
          <p className="form-field__hint">Add a short, descriptive headline</p>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
            className={errors.title ? "field-invalid" : ""}
          />
          {errors.title && (
            <p className="field-error" id="title-error">
              {errors.title}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="category">Category</label>
          <p className="form-field__hint">Choose a category for your feedback</p>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="description">Feedback Detail</label>
          <p className="form-field__hint">
            Include any specific comments on what should be improved, added, etc.
          </p>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "description-error" : undefined}
            className={errors.description ? "field-invalid" : ""}
          />
          {errors.description && (
            <p className="field-error" id="description-error">
              {errors.description}
            </p>
          )}
        </div>

        {submitError && <p className="error-message">{submitError}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn--secondary" onClick={() => navigate("/")}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Feedback"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddFeedbackPage;
