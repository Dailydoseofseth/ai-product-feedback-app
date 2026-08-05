# _Product Requirements Document — Product Feedback App_

**Client:** My Company
**Author:** Seth (freelance full-stack developer)
**Status:** Draft v1.0
**Last updated:** 2026-08-05

---

# 1. Overview

My Company is a startup building a new product and wants a way for customers to submit and browse feedback about how the product could be improved. This project delivers a **Product Feedback application**: a small full-stack app where customers can view existing suggestions, filter them by category, and submit new suggestions of their own.

**Primary users:** Customers of My Company's product who want to request features, report friction, or suggest improvements.

**Core value:** A single, low-friction place to see what's already been suggested (avoiding duplicate requests) and to add new feedback in under a minute.

This is a two-page application: a **Home page** for browsing/filtering feedback, and an **AddFeedback page** for submitting new feedback. Upvoting, comments, sorting, editing, and deleting are explicitly out of scope for v1 (see Section 7).

---

# 2. Pages & User Flows

## 2.1 Home page (`/`)

**Purpose:** View and filter all submitted suggestions.

**Layout (confirmed against Figma):**

- A branding card: "**My Company**" (bold) above "Feedback Board" (subdued), on a purple/pink gradient background — top-left on desktop/tablet, full-width top banner on mobile.
- A category filter panel directly below the branding card: rounded pill/chip buttons, one per option (see 2.1.2). Desktop/tablet wrap as two rows (row 1: All, UI, UX; row 2: Enhancement, Bug, Feature); mobile wraps as row 1: All, UI, UX, Enhancement; row 2: Bug, Feature. The active chip is solid indigo with white text; inactive chips are light lavender background with indigo text.
- A dark navy header bar above the suggestion list containing: a lightbulb icon + "**N Suggestions**" count (N = number of suggestions currently displayed for the active filter) on the left, and a "**+ Add Feedback**" button (solid purple/gradient) on the right that navigates to `/add-feedback`.
- A list/feed of suggestion cards below that header bar, each in a white rounded card on a light gray page background.

**2.1.1 Viewing all suggestions**

- On page load, the app calls `GET /get-all-suggestions` and renders every suggestion as a card, and the "N Suggestions" count reflects the total returned.
- Each suggestion card displays: **title** (bold, dark), **description** (gray body text), and **category** (as a rounded lavender tag/badge below the description). No upvote count, comment count, or status indicator is shown on the card (see Section 7 — out of scope for v1).
- Suggestions render in the order returned by the API (newest first — see Section 3, `created_at DESC`).
- While the request is in flight, no specific loading UI is required for v1 (see Out of Scope — stretch goal only). The list should simply populate once data arrives.
- If the request fails (network/server error), display a simple inline error message (e.g. "Something went wrong loading feedback. Please try again.") in place of the list. Do not show the empty-state screen (2.1.3) for a failed request — that screen is reserved for a successful response with zero results.

**2.1.2 Filtering suggestions by category**

- Available filter options: **All**, **UI**, **UX**, **Enhancement**, **Bug**, **Feature**.
- "All" is the default/active filter on initial page load, showing every suggestion (calls `GET /get-all-suggestions`).
- Selecting any other category calls `GET /get-suggestions-by-category/:category` with that category, and replaces the visible list with only matching suggestions.
- Exactly one filter is active at a time (single-select, not multi-select — multi-filtering is out of scope, see Section 7).
- The active filter is visually distinguished (e.g. filled/highlighted button) from inactive ones.
- Filter state is client-side only for v1: it does **not** persist across a page refresh or in the URL. On refresh, the filter resets to "All".

**2.1.3 Empty state ("There is no feedback yet.")**

- Triggered when the currently selected filter's API response is a successful `200` with an empty array (`[]`) — i.e., zero suggestions exist for that category (or zero suggestions exist at all, if "All" is selected on a fresh database).
- Replaces the suggestion list area (the "N Suggestions" header bar and "+ Add Feedback" button above it stay visible) with, exact copy per Figma:
  - An illustration: a character wearing a hat, holding a magnifying glass.
  - Heading: **"There is no feedback yet."**
  - Body text: **"Got a suggestion? Found a bug that needs to be squashed? We love hearing about new ideas to improve our app."**
  - A "**+ Add Feedback**" button below the body text, linking to `/add-feedback` (same destination as the header button — this is a second, redundant entry point per the design, not a different action).
- The category filter row remains visible and interactive while the empty state is shown, so the user can switch to a different category without reloading the page.

## 2.2 AddFeedback page (`/add-feedback`)

**Purpose:** Submit a new suggestion.

**Layout (confirmed against Figma — exact copy quoted):**

- A "**Go Back**" link with a left-chevron icon, top-left of the page, that returns to the Home page (`/`) without submitting.
- A purple/pink gradient circular icon with a white "+" above the form heading.
- Heading: "**Create New Feedback**"
- Form fields, each with a bold label and a gray helper line beneath it:
  1. **Feedback Title** — helper text "_Add a short, descriptive headline_" — single-line text input.
  2. **Category** — helper text "_Choose a category for your feedback_" — select/dropdown with options: UI, UX, Enhancement, Bug, Feature. **Defaults to "Feature" pre-selected** (confirmed in Figma); since a valid category is always selected by default, the Category field cannot be submitted blank and does not need a "required" validation error in practice — validate defensively server-side anyway.
  3. **Feedback Detail** — helper text "_Include any specific comments on what should be improved, added, etc._" — multi-line textarea.
- Two buttons, bottom-right of the form: a primary "**Submit Feedback**" button (solid purple) and a secondary "**Cancel**" button (slate/navy) immediately to its left. Both "Cancel" and the top "Go Back" link perform the same action — return to `/` without submitting — Cancel is simply a second, redundant entry point per the design.

### **2.2.1 Submitting a new suggestion**

- On successful submit, the form calls `POST /add-one-suggestion` with `{ title, category, description }`.
- On a successful (`201`) response, the user is redirected to the Home page (`/`), and the new suggestion appears in the list (either by refetching `GET /get-all-suggestions` or by prepending the returned suggestion object to local state).
- If the active filter on Home was anything other than "All" or the new suggestion's category, the new item will not be visible until the user switches filters — this is expected behavior, not a bug.
- On a failed submit (network/server error), keep the user on the AddFeedback page, do not clear the form fields, and show an inline error message (e.g. "Couldn't submit your feedback. Please try again.").

### **2.2.2 Form validation rules**

All validation happens **client-side before submit** AND is **re-validated server-side** on the API (client-side validation alone is not sufficient — see Section 8 security notes below).

| Field       | Rule                                                                                                                 | Error message shown                                                               |
| ----------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Title       | Required. Min 2 characters, max 100 characters after trimming whitespace.                                            | "Can't be empty" (if blank) / "Title must be between 2 and 100 characters"        |
| Category    | Required. Must be one of: UI, UX, Enhancement, Bug, Feature (exact match, case-sensitive to the stored enum values). | "Please select a category"                                                        |
| Description | Required. Min 10 characters, max 500 characters after trimming whitespace.                                           | "Can't be empty" (if blank) / "Description must be between 10 and 500 characters" |

- Validation errors display inline, directly beneath the offending field, in a distinguishable color (per Figma — typically red/orange) as soon as the user attempts to submit with invalid data (validate on submit, not necessarily on every keystroke — re-validate on submit is the minimum bar).
- The submit button does not navigate away or hit the API while any field is invalid.
- Fields with errors get a visually distinct border/outline in addition to the text message (for accessibility — do not rely on color alone).
- If the user corrects a field and re-submits, the corresponding error message clears.

---

# 3. Data Model

A single table, **`suggestions`**, backs both pages for v1.

| Column        | Type                 | Constraints                     | Notes                                                                                                          |
| ------------- | -------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `id`          | `SERIAL` / `INTEGER` | `PRIMARY KEY`                   | Auto-incrementing.                                                                                             |
| `title`       | `VARCHAR(100)`       | `NOT NULL`                      | 2–100 chars enforced at API layer.                                                                             |
| `category`    | `VARCHAR(20)`        | `NOT NULL`, constrained to enum | One of: `UI`, `UX`, `Enhancement`, `Bug`, `Feature`. Enforce via a `CHECK` constraint or Postgres `ENUM` type. |
| `description` | `TEXT`               | `NOT NULL`                      | 10–500 chars enforced at API layer.                                                                            |
| `created_at`  | `TIMESTAMP`          | `NOT NULL DEFAULT NOW()`        | Used to order the feed newest-first.                                                                           |

**Sample seed data (minimum 3 rows, one per a spread of categories):**

```sql
INSERT INTO suggestions (title, category, description) VALUES
('Add dark mode', 'UI', 'A dark theme option would help reduce eye strain when using the app at night.'),
('App crashes on login', 'Bug', 'The app consistently crashes when logging in with an email that contains a plus sign.'),
('Export data to CSV', 'Feature', 'It would be great to export my suggestion history as a CSV file for reporting.');
```

**Explicitly not part of the v1 data model** (see Section 7): `upvotes`, `status`, `comments`, `user_id`/authorship. If added later as a stretch goal, they will require a migration and PRD update — do not let the agent add these columns speculatively now.

---

# 4. API Endpoints

Base URL (local dev): `http://localhost:5000` (or agreed port). Base URL (deployed): the Render service URL, documented in the README.

All responses are `application/json`. All error responses follow the shape:

```json
{ "error": "human-readable message" }
```

## 4.1 `GET /get-all-suggestions`

Returns every suggestion, newest first.

- **Method:** GET
- **Path:** `/get-all-suggestions`
- **Path/query params:** none
- **Request body:** none
- **Success response:** `200 OK`

```json
[
  {
    "id": 3,
    "title": "Export data to CSV",
    "category": "Feature",
    "description": "It would be great to export my suggestion history as a CSV file for reporting.",
    "created_at": "2026-08-01T14:22:00.000Z"
  },
  {
    "id": 2,
    "title": "App crashes on login",
    "category": "Bug",
    "description": "The app consistently crashes when logging in with an email that contains a plus sign.",
    "created_at": "2026-07-30T09:10:00.000Z"
  }
]
```

- **Empty case:** `200 OK` with `[]` (zero suggestions in the database) — this is what triggers the Home page empty state when "All" is selected.
- **Error response:** `500 Internal Server Error` — `{ "error": "Failed to fetch suggestions" }`

## 4.2 `GET /get-suggestions-by-category/:category`

Returns suggestions matching the given category, newest first.

- **Method:** GET
- **Path:** `/get-suggestions-by-category/:category`
- **Path params:** `category` (string) — one of `UI`, `UX`, `Enhancement`, `Bug`, `Feature` (case-sensitive exact match against the stored value).
- **Request body:** none
- **Success response:** `200 OK` — same array shape as 4.1, filtered to the matching category.
- **Empty case:** `200 OK` with `[]` — zero suggestions exist for that category. This is what triggers the Home page empty state.
- **Invalid category response:** `400 Bad Request` — `{ "error": "Invalid category" }` when `:category` is not one of the five valid values. (The frontend should never send an invalid value since it only exposes the five buttons/options, but the API must validate server-side regardless.)
- **Error response:** `500 Internal Server Error` — `{ "error": "Failed to fetch suggestions" }`

## 4.3 `POST /add-one-suggestion`

Creates a new suggestion.

- **Method:** POST
- **Path:** `/add-one-suggestion`
- **Request body:**

```json
{
  "title": "Add dark mode",
  "category": "UI",
  "description": "A dark theme option would help reduce eye strain when using the app at night."
}
```

- **Validation (server-side, mirrors Section 2.2.2):**
  - `title`: required, string, trimmed length 2–100.
  - `category`: required, must exactly match one of `UI`, `UX`, `Enhancement`, `Bug`, `Feature`.
  - `description`: required, string, trimmed length 10–500.
  - All three fields must be present; reject with `400` if any is missing, empty after trimming, out of length range, or (for category) not in the allowed set.
- **Success response:** `201 Created`, body is the newly created row:

```json
{
  "id": 4,
  "title": "Add dark mode",
  "category": "UI",
  "description": "A dark theme option would help reduce eye strain when using the app at night.",
  "created_at": "2026-08-05T10:00:00.000Z"
}
```

- **Validation error response:** `400 Bad Request`

```json
{ "error": "Title must be between 2 and 100 characters" }
```

(Return the first failing validation message; multiple simultaneous field errors are not required to be batched into one response for v1.)

- **Error response:** `500 Internal Server Error` — `{ "error": "Failed to create suggestion" }`

---

# 5. Tech Stack & Deployment

| Layer      | Language              | Framework  | Deployment | Dev tools                         |
| ---------- | --------------------- | ---------- | ---------- | --------------------------------- |
| Frontend   | HTML, CSS, JavaScript | React      | Netlify    | —                                 |
| Server/API | Node.js               | Express    | Render     | Postman (manual endpoint testing) |
| Database   | SQL                   | PostgreSQL | Neon       | —                                 |

- The frontend calls the deployed Render API URL in production, and `localhost` in development (via an environment variable, e.g. `REACT_APP_API_URL` / `VITE_API_URL` — not hardcoded).
- The API connects to Neon via a `DATABASE_URL` connection string stored in an environment variable, never committed to the repo (`.env` must be gitignored).
- CORS on the Express server is restricted to the deployed Netlify origin (plus `localhost` for dev), not left open to `*`.
- All SQL queries use parameterized queries (e.g. `pg` library's `$1, $2` placeholders), never raw string concatenation.

---

# 6. Design Reference

- **Figma file:** https://www.figma.com/design/vxjX8SdBOt21DCD14mrBM9/Product-Feedback-App-Design?node-id=0-1&p=f&t=9Z3vNvOcL6IHXzsc-0
- Home page and AddFeedback page layouts, spacing, colors, and typography should follow the Figma file exactly where specified. The file already brands the app as "My Company / Feedback Board" per Section 2.1's layout — no renaming needed.
- **Confirmed frames in the Figma file** (verified via the Figma MCP connector against a duplicated copy of the file): `Mobile/Tablet/Desktop - Suggestions`, `Mobile/Tablet/Desktop - Suggestions - Empty`, `Mobile/Tablet/Desktop - New Feedback`, and a `Desktop - New Feedback - Active` variant showing the invalid/error state referenced in Section 2.2.2.
- **Confirmed responsive breakpoints** (from actual frame widths in the file, not estimated):
  - Mobile frames: **375px** wide — branding banner, filter chips, and header bar stack full-width; filter chips wrap 4-then-2 (All/UI/UX/Enhancement, then Bug/Feature).
  - Tablet frames: **768px** wide — branding card and filter panel sit side-by-side above the suggestion list in a similar arrangement to desktop, just narrower.
  - Desktop frames: **1440px** wide — branding card and filter panel form a left sidebar/column; the "N Suggestions" header bar and suggestion list occupy the remaining width; filter chips wrap 3-then-3 (All/UI/UX, then Enhancement/Bug/Feature).
- Where Figma and this PRD conflict on visual details not covered above, Figma is the visual source of truth; this PRD is the source of truth for data/behavior/API contracts.

---

# 7. Out of Scope (v1)

Explicitly not being built in this pass — do not let the agent add any of these speculatively:

- Upvoting / vote counts on suggestions
- Comments on suggestions
- Sorting (by upvotes, comments, date, etc.)
- Editing an existing suggestion
- Deleting an existing suggestion
- Multi-select category filtering (only single-category or "All" filtering)
- User accounts, authentication, or authorship tracking
- Loading spinners / skeleton states (nice-to-have, not required for v1 correctness)
- Persisting filter selection across page refresh or in the URL
- Hamburger/mobile nav menu beyond whatever the two pages inherently need
- Pagination (all suggestions load in a single response for v1 — dataset is assumed small)

These map to the project's stretch goals and may be picked up in a later iteration with their own PRD addendum.

---

# 8. Non-Functional Notes (carried into later milestones, recorded here for traceability)

- **Accessibility:** all form inputs need associated `<label>` elements; images/icons need `alt` text (empty `alt=""` for purely decorative ones); color is never the sole indicator of validation state; interactive elements are keyboard-navigable and focus-visible.
- **Security:** no secrets committed to the repo; all input validated and sanitized server-side (not just client-side); parameterized SQL queries only; CORS scoped to the real frontend origin, not `*`.
- **Performance/SEO:** deployed frontend should be checked with Lighthouse (Performance, Accessibility, Best Practices, SEO) and flagged issues addressed before final submission.

These are enforced/audited in later milestones (6–9) but are stated here so the initial build doesn't contradict them (e.g., the agent should not scaffold wide-open CORS or string-concatenated SQL "to get it working" now and have to redo it later).
