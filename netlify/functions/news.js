const FEEDS = [
  "https://www.sciencedaily.com/rss/top/technology.xml",
  "https://www.sciencedaily.com/rss/top/science.xml",
  "https://www.sciencedaily.com/rss/top/environment.xml",
  "https://news.google.com/rss/search?q=engineering+technology&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=engineering+energy&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=robotics+engineering&hl=en-US&gl=US&ceid=US:en"
];

const ENGINEERING_KEYWORDS = [
  "engineering",
  "engineer",
  "technology",
  "robot",
  "robotics",
  "artificial intelligence",
  "ai",
  "machine learning",
  "mechanical",
  "electrical",
  "electronics",
  "civil engineering",
  "construction",
  "infrastructure",
  "energy",
  "solar",
  "wind power",
  "renewable",
  "battery",
  "batteries",
  "nuclear",
  "materials",
  "manufacturing",
  "aerospace",
  "spacecraft",
  "satellite",
  "automotive",
  "vehicle",
  "semiconductor",
  "chip",
  "computer",
  "climate technology",
  "environmental technology",
  "water technology"
];

function cleanText(text = "") {
  return text
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(item, tag) {
  const regex = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
    "i"
  );

  const match = item.match(regex);

  if (!match) return "";

  return cleanText(match[1]);
}

function getLink(item) {
  const normalLink = getTag(item, "link");

  if (normalLink) {
    return normalLink;
  }

  const hrefMatch = item.match(
    /<link[^>]+href=["']([^"']+)["']/i
  );

  return hrefMatch ? hrefMatch[1] : "";
}

function parseRSS(xml) {
  const items = [];

  const itemMatches = xml.match(
    /<item\b[\s\S]*?<\/item>/gi
  );

  if (!itemMatches) {
    return items;
  }

  for (const item of itemMatches) {
    const title = getTag(item, "title");
    const description =
      getTag(item, "description") ||
      getTag(item, "summary") ||
      "";

    const link = getLink(item);

    const publishedAt =
      getTag(item, "pubDate") ||
      getTag(item, "published") ||
      getTag(item, "updated") ||
      "";

    const source =
      getTag(item, "source") ||
      getTag(item, "creator") ||
      "Engineering News";

    if (!title || !link) {
      continue;
    }

    items.push({
      title,
      description,
      link,
      publishedAt,
      source
    });
  }

  return items;
}

function isRelevant(article) {
  const text = (
    article.title +
    " " +
    article.description
  ).toLowerCase();

  return ENGINEERING_KEYWORDS.some((keyword) =>
    text.includes(keyword)
  );
}

function getCategory(article) {
  const text = (
    article.title +
    " " +
    article.description
  ).toLowerCase();

  if (
    text.includes("robot") ||
    text.includes("automation")
  ) {
    return "Robotics";
  }

  if (
    text.includes("artificial intelligence") ||
    text.includes(" ai ") ||
    text.includes("machine learning")
  ) {
    return "AI";
  }

  if (
    text.includes("solar") ||
    text.includes("wind") ||
    text.includes("battery") ||
    text.includes("nuclear") ||
    text.includes("renewable") ||
    text.includes("energy")
  ) {
    return "Energy";
  }

  if (
    text.includes("electrical") ||
    text.includes("electronics") ||
    text.includes("semiconductor") ||
    text.includes("chip")
  ) {
    return "Electrical";
  }

  if (
    text.includes("mechanical") ||
    text.includes("manufacturing") ||
    text.includes("automotive") ||
    text.includes("vehicle")
  ) {
    return "Mechanical";
  }

  if (
    text.includes("construction") ||
    text.includes("infrastructure") ||
    text.includes("building") ||
    text.includes("bridge")
  ) {
    return "Civil";
  }

  if (
    text.includes("material") ||
    text.includes("metal") ||
    text.includes("alloy") ||
    text.includes("nanomaterial")
  ) {
    return "Materials";
  }

  if (
    text.includes("environment") ||
    text.includes("climate") ||
    text.includes("water") ||
    text.includes("pollution")
  ) {
    return "Environmental";
  }

  return "Technology";
}

function calculateImportance(article) {
  const text = (
    article.title +
    " " +
    article.description
  ).toLowerCase();

  let score = 50;

  const highImpactWords = [
    "breakthrough",
    "major",
    "new technology",
    "discovery",
    "first",
    "world's first",
    "revolutionary",
    "record",
    "nuclear",
    "fusion",
    "space",
    "satellite",
    "ai",
    "artificial intelligence",
    "robot",
    "battery",
    "energy",
    "semiconductor"
  ];

  for (const word of highImpactWords) {
    if (text.includes(word)) {
      score += 5;
    }
  }

  const negativeWords = [
    "study",
    "research",
    "could",
    "might",
    "may"
  ];

  for (const word of negativeWords) {
    if (text.includes(word)) {
      score -= 2;
    }
  }

  return Math.max(20, Math.min(99, score));
}

function formatTime(date) {
  if (!date || Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const now = Date.now();
  const difference = now - date.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function makeSummary(description, title) {
  const cleaned = cleanText(description);

  if (cleaned) {
    return cleaned.length > 280
      ? cleaned.substring(0, 277) + "..."
      : cleaned;
  }

  return `Latest developments in engineering and technology: ${title}`;
}

function makeImpact(article) {
  const category = article.category;

  const impacts = {
    Mechanical:
      "This development could influence future machines, manufacturing and mechanical systems.",
    Electrical:
      "This could contribute to advances in electronics, electrical systems and connected technology.",
    Energy:
      "This development could affect future energy generation, storage and sustainability.",
    Robotics:
      "This could expand the capabilities of robots and automated systems.",
    AI:
      "This development could influence how artificial intelligence is integrated into engineering and technology.",
    Civil:
      "This could influence infrastructure, construction and the development of future cities.",
    Materials:
      "New materials can enable lighter, stronger or more efficient engineering systems.",
    Environmental:
      "This could contribute to more sustainable engineering and environmental technology.",
    Technology:
      "This development could influence future engineering and technological systems."
  };

  return impacts[category] || impacts.Technology;
}

async function fetchFeed(url) {
  try {
    const response = await fetch(
      `${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`,
      {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; EngiPulse/1.0; +https://engipulse.netlify.app)",
          Accept:
            "application/rss+xml, application/xml, text/xml, */*",
          "Cache-Control": "no-cache",
          Pragma: "no-cache"
        }
      }
    );

    if (!response.ok) {
      console.error(
        `Feed failed: ${response.status} ${url}`
      );
      return [];
    }

    const xml = await response.text();

    console.log(
      `Feed ${url} returned ${xml.length} characters`
    );

    return parseRSS(xml);
  } catch (error) {
    console.error(
      `Feed error for ${url}:`,
      error.message
    );

    return [];
  }
}

export default async function handler() {
  try {
    console.log("EngiPulse news function started");

    const results = await Promise.all(
      FEEDS.map((feed) => fetchFeed(feed))
    );

    const rawArticles = results.flat();

    console.log(
      `Total RSS articles received: ${rawArticles.length}`
    );

    const relevantArticles =
      rawArticles.filter(isRelevant);

    console.log(
      `Relevant engineering articles: ${relevantArticles.length}`
    );

    const seen = new Set();

    const uniqueArticles = [];

    for (const article of relevantArticles) {
      const normalizedUrl = article.link
        .trim()
        .toLowerCase();

      if (!normalizedUrl || seen.has(normalizedUrl)) {
        continue;
      }

      seen.add(normalizedUrl);
      uniqueArticles.push(article);
    }

    uniqueArticles.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime() || 0;
      const dateB = new Date(b.publishedAt).getTime() || 0;

      return dateB - dateA;
    });

    const articles = uniqueArticles
      .slice(0, 60)
      .map((article, index) => {
        const date = new Date(
          article.publishedAt
        );

        const category = getCategory(article);

        const formattedArticle = {
          id:
            `${Date.now()}-${index}-` +
            Buffer.from(article.link)
              .toString("base64")
              .substring(0, 12),

          title: article.title,

          summary: makeSummary(
            article.description,
            article.title
          ),

          category,

          source:
            article.source ||
            "Engineering News",

          url: article.link,

          link: article.link,

          publishedAt:
            !Number.isNaN(date.getTime())
              ? date.toISOString()
              : new Date().toISOString(),

          time: formatTime(date),

          importance: calculateImportance(article)
        };

        formattedArticle.impact =
          makeImpact(formattedArticle);

        return formattedArticle;
      });

    console.log(
      `Returning ${articles.length} articles to EngiPulse`
    );

    return new Response(
      JSON.stringify(articles),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0"
        }
      }
    );
  } catch (error) {
    console.error(
      "EngiPulse function crashed:",
      error
    );

    return new Response(
      JSON.stringify({
        error: "News function failed",
        message: error.message,
        articles: []
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
