import { ArrowDownUp } from "lucide-react";

export default function SortControl({ sort, setSort }) {
  return (
    <div className="sort-control">
      <ArrowDownUp size={17} />

      <span>Sort:</span>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="important">
          Most Important → Least Important
        </option>

        <option value="latest">
          Latest → Oldest
        </option>
      </select>
    </div>
  );
}
