```jsx
import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import Header from "./components/Header";
import CategoryBar from "./components/CategoryBar";
import SortControl from "./components/SortControl";
import NewsCard from "./components/NewsCard";

import { categories } from "./data";

export default function App() {
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState("latest");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [saved, setSaved] = useState(() => {
    try {
      const stored = localStorage.getItem(
        "engineering-pulse-saved"
      );

      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  async function refreshNews() {
    try {
      setLoading(true);
      setError("");

      /*
        Add a unique timestamp to every request.

        This prevents the browser, CDN or another cache
        from simply returning an older /api/news response.
      */
      const response = await fetch(
        `/api/news?refresh=${Date.now()}`,
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache"
          }
        }
      );

      if (!response.ok) {
        throw new Error(
          `News API returned HTTP ${response.status}`
        );
      }

      const news = await response.json();

      if (!Array.isArray(news)) {
        throw new Error("Invalid news data");
      }

      setArticles(news);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        "News loading error:",
        err
      );

      setError(
        "Could not load the latest engineering news."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
    Load news immediately when the website opens.
  */
  useEffect(() => {
    refreshNews();
  }, []);

  /*
    Automatically check for new articles every 10 minutes.
  */
  useEffect(() => {
    const interval = setInterval(() => {
      refreshNews();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  /*
    Save bookmarks locally on the user's device.
  */
  useEffect(() => {
    localStorage.setItem(
      "engineering-pulse-saved",
      JSON.stringify(saved)
    );
  }, [saved]);

  function toggleSave(id) {
    setSaved((current) => {
      if (current.includes(id)) {
        return current.filter(
          (item) => item !== id
        );
      }

      return [...current, id];
    });
  }

  /*
    Filtering + searching + sorting.
  */
  const filteredArticles = useMemo(() => {
    let result = [...articles];

    /*
      Category filter
    */
    if (selectedCategory !== "All") {
      result = result.filter(
        (article) =>
          article.category === selectedCategory
      );
    }

    /*
      Search
    */
    if (search.trim()) {
      const query = search
        .trim()
        .toLowerCase();

      result = result.filter((article) => {
        const searchableText = [
          article.title,
          article.summary,
          article.category,
          article.source
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    /*
      Sorting
    */
    if (sort === "important") {
      result.sort((a, b) => {
        return (
          (b.importance || 0) -
          (a.importance || 0)
        );
      });
    } else {
      result.sort((a, b) => {
        return (
          (b.timestamp || 0) -
          (a.timestamp || 0)
        );
      });
    }

    return result;
  }, [
    articles,
    selectedCategory,
    search,
    sort
  ]);

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
              Stay up to date with the latest
              engineering developments from
              around the world.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={refreshNews}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "spinning"
                  : ""
              }
            />

            {loading
              ? "Loading..."
              : "Refresh"}
          </button>
        </section>

        <div className="update-bar">
          <span className="live-dot" />

          <span>Live</span>

          <span>
            Updated{" "}
            {lastUpdated.toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit"
              }
            )}
          </span>

          <span className="next-update">
            Automatically checks for new
            articles every 10 minutes
          </span>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

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
              {loading
                ? "Loading stories..."
                : `${filteredArticles.length} stories`}
            </span>
          </div>

          <SortControl
            sort={sort}
            setSort={setSort}
          />
        </div>

        <section className="news-grid">
          {loading &&
          articles.length === 0 ? (
            <div className="empty">
              <h3>
                Loading engineering news...
              </h3>

              <p>
                Getting the latest articles
                from ScienceDaily.
              </p>
            </div>
          ) : filteredArticles.length > 0 ? (
            filteredArticles.map(
              (article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  saved={saved.includes(
                    article.id
                  )}
                  onSave={toggleSave}
                />
              )
            )
          ) : (
            <div className="empty">
              <h3>
                No articles found
              </h3>

              <p>
                Try a different search or
                category.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer>
        <p>
          Engineering Pulse • Built for
          engineering students and
          enthusiasts
        </p>
      </footer>
    </div>
  );
}
```
