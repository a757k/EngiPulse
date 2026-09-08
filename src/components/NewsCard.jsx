import {
  Bookmark,
  ExternalLink,
  Clock,
  Sparkles
} from "lucide-react";

export default function NewsCard({
  article,
  saved,
  onSave
}) {
  return (
    <article className="news-card">

      <div className="card-top">

        <span className="category-tag">
          {article.category}
        </span>

        <button
          className={saved ? "save-button saved" : "save-button"}
          onClick={() => onSave(article.id)}
          aria-label="Save article"
        >
          <Bookmark
            size={18}
            fill={saved ? "currentColor" : "none"}
          />
        </button>

      </div>

      <div className="importance">
        <span>Importance</span>

        <div className="importance-bar">
          <div
            style={{
              width: `${article.importance}%`
            }}
          />
        </div>

        <strong>{article.importance}</strong>
      </div>

      <h2>{article.title}</h2>

      <div className="article-meta">
        <span>{article.source}</span>

        <span>
          <Clock size={14} />
          {article.time}
        </span>
      </div>

      <p className="summary">
        {article.summary}
      </p>

      <div className="impact">

        <div className="impact-title">
          <Sparkles size={16} />
          Engineering Impact
        </div>

        <p>{article.impact}</p>

      </div>

      <a
        className="read-button"
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Read full article
        <ExternalLink size={16} />
      </a>

    </article>
  );
}
