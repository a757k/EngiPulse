```jsx
import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import Header from "./components/Header";
import CategoryBar from "./components/CategoryBar";
import SortControl from "./components/SortControl";
import NewsCard from "./components/NewsCard";

import { categories } from "./data";

function App() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState("important");
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("engineering-pulse-saved");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setSavedArticles(parsed);
        }
      }
    } catch (error) {
      console.error("Error loading saved articles:", error);
      setSavedArticles([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "engineering-pulse-saved",
        JSON.stringify(savedArticles)
      );
    } catch (error) {
      console.error("Error saving articles:", error);
    }
  }, [savedArticles]);

  async function fetchNews(manualRefresh) {
    try {
      if (manualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const cacheBuster =
        Date.now().toString() +
        "-" +
        Math.random().toString(36).substring(2);

      const response = await fetch(
        "/api/news?refresh=" + cacheBuster,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache"
          }
        }
      );

      if (!response.ok) {
        throw new Error(
          "News API returned status " + response.status
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("News API returned invalid data.");
      }

      setArticles(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("News loading error:", error);

      setError(
        "Unable to load the latest engineering news. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchNews(false);

    const interval = setInterval(() => {
      fetchNews(true);
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  function toggleSaved(articleId) {
    setSavedArticles((current) => {
      if (current.includes(articleId)) {
        return current.filter((id) => id !== articleId);
      }

      return [...current, articleId];
    });
  }

  const filteredArticles = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    let result = articles.filter((article) => {
      const categoryMatches =
        selectedCategory === "All" ||
        article.category === selectedCategory;

      if (!categoryMatches) {
        return false;
      }

      if (!searchTerm) {
        return true;
      }

      const searchableText = [
        article.title,
        article.summary,
        article.category,
        article.source,
        article.impact
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchTerm);
    });

    result = [...result];

    if (sort === "important") {
      result.sort((a, b) => {
        const importanceA = Number(a.importance) || 0;
        const importanceB = Number(b.importance) || 0;

        if (importanceA !== importanceB) {
          return importanceB - importanceA;
        }

        const dateA = new Date(
          a.publishedAt || a.date || 0
        ).getTime();

        const dateB = new Date(
          b.publishedAt || b.date || 0
        ).getTime();

        return dateB - dateA;
      });
    } else {
      result.sort((a, b) => {
        const dateA = new Date(
          a.publishedAt || a.date || 0
        ).getTime();

        const dateB = new Date(
          b.publishedAt || b.date || 0
        ).getTime();

        return dateB - dateA;
      });
    }

    return result;
  }, [
    articles,
    search,
    selectedCategory,
    sort
  ]);

  function getLastUpdatedText() {
    if (!lastUpdated) {
      return "";
    }

    return lastUpdated.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  return (
    <div className="app">
      <Header
        search={search}
        setSearch={setSearch}
        savedCount={savedArticles.length}
      />

      <main className="main-content">
        <div className="top-section">
          <div>
            <h2 className="page-title">
              Engineering News
            </h2>

            <p className="page-subtitle">
              Global engineering developments, technologies and discoveries.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={() => fetchNews(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "spinning" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <CategoryBar
          categories={categories}
          selected={selectedCategory}
          setSelected={setSelectedCategory}
        />

        <div className="controls-row">
          <div className="results-count">
            {loading
              ? "Loading engineering news..."
              : filteredArticles.length +
                " article" +
                (filteredArticles.length === 1 ? "" : "s")}
          </div>

          <SortControl
            sort={sort}
            setSort={setSort}
          />
        </div>

        {lastUpdated && !loading && (
          <div className="updated-text">
            Last updated at {getLastUpdatedText()}
          </div>
        )}

        {error && (
          <div className="error-message">
            <strong>News update failed.</strong>

            <span>{error}</span>

            <button
              onClick={() => fetchNews(true)}
              disabled={refreshing}
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <RefreshCw
              size={28}
              className="spinning"
            />

            <p>
              Loading the latest engineering news...
            </p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="empty-state">
            <h3>No articles found</h3>

            <p>
              Try changing the category or search term.
            </p>
          </div>
        ) : (
          <section className="news-grid">
            {filteredArticles.map((article, index) => (
              <NewsCard
                key={
                  article.id ||
                  article.url ||
                  article.link ||
                  index
                }
                article={article}
                saved={savedArticles.includes(
                  article.id
                )}
                onSave={toggleSaved}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
```
