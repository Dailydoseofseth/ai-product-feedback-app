import { FILTERS } from "../constants";

function CategoryFilter({ activeFilter, onSelect }) {
  return (
    <nav className="category-filter" aria-label="Filter suggestions by category">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          className={`filter-chip${filter === activeFilter ? " filter-chip--active" : ""}`}
          aria-pressed={filter === activeFilter}
          onClick={() => onSelect(filter)}
        >
          {filter}
        </button>
      ))}
    </nav>
  );
}

export default CategoryFilter;
