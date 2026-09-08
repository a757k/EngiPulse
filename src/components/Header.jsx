import { Search, Bookmark, Activity } from "lucide-react";

export default function Header({ search, setSearch, savedCount }) {
  return (
    <header className="header">
      <div className="header-inner">

        <div className="brand">
          <div className="brand-icon">
            <Activity size={22} />
          </div>

          <div>
            <h1>Engineering Pulse</h1>
            <span>Global engineering news</span>
          </div>
        </div>

        <div className="header-actions">

          <div className="search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search engineering news..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="saved">
            <Bookmark size={18} />
            <span>{savedCount}</span>
          </div>

        </div>

      </div>
    </header>
  );
}
