import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import Header from "./components/Header";
import CategoryBar from "./components/CategoryBar";
import SortControl from "./components/SortControl";
import NewsCard from "./components/NewsCard";

import { articles, categories } from "./data";

export default function App() {
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [sort, setSort] = useState("important");

  const [search, setSearch] = useState("");

  const [lastUpdated, setLastUpdated] =
    useState(new Date());

  const [saved, setSaved] = useState(() => {
    const stored = localStorage.getItem(
      "engineering-pulse-saved"
    );

    return stored ? JSON.parse(stored) : [];
  });

  const refreshNews = () => {
    setLastUpdated(new Date());
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshNews();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "engineering-pulse-saved",
      JSON.stringify(saved)
    );
  }, [saved]);

  const toggleSave = (id) => {
    setSaved((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const filteredArticles = useMemo(() => {
    let result = [...articles];

    if (selectedCategory !== "All") {
      result = result.filter(
        (article) =>
          article.category === selectedCategory
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((article) =>
        `${article.title} ${article.summary} ${article.category}`
          .toLowerCase()
          .includes(query)
      );
    }

    if (sort === "important") {
      result.sort(
        (a, b) => b.importance - a.importance
      );
    } else {
      result.sort(
        (a, b) => b.timestamp - a.timestamp
      );
    }

    return result;
  }, [selectedCategory, search, sort]);

  return (
    <div className="app">

      <Header
        search={search}
        setSearch={setSearch}
        savedCount={saved.length}
      />

      <main className="container">

        <section className="hero">

          <div>
            <p className="eyebrow">
              WORLDWIDE ENGINEERING
            </p>

            <h2>
              Today's engineering news
            </h2>

            <p>
              Stay up to date with the developments
              shaping engineering around the world.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={refreshNews}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

        </section>

        <div className="update-bar">
          <span className="live-dot" />
          Live

          <span>
            Updated{" "}
            {lastUpdated.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </span>

          <span className="next-update">
            Automatically refreshes every 10 minutes
          </span>
        </div>

        <CategoryBar
          categories={categories}
          selected={selectedCategory}
          setSelected={setSelectedCategory}
        />

        <div className="news-heading">

          <div>
            <h3>
              {selectedCategory === "All"
                ? "Latest stories"
                : selectedCategory}
            </h3>

            <span>
              {filteredArticles.length} stories today
            </span>
          </div>

          <SortControl
            sort={sort}
            setSort={setSort}
          />

        </div>

        <section className="news-grid">

          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                saved={saved.includes(article.id)}
                onSave={toggleSave}
              />
            ))
          ) : (
            <div className="empty">
              <h3>No articles found</h3>
              <p>
                Try a different search or category.
              </p>
            </div>
          )}

        </section>

      </main>

      <footer>
        <p>
          Engineering Pulse • Built for engineering
          students and enthusiasts
        </p>
      </footer>

    </div>
  );
}
