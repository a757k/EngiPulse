```js
const RSS_FEEDS = [
  "https://www.sciencedaily.com/rss/top/technology.xml",
  "https://www.sciencedaily.com/rss/top/science.xml",
  "https://www.sciencedaily.com/rss/top/environment.xml"
];

function cleanText(text = "") {
  return text
    .replace(/<!\[CDATA\[/gi, "")
    .replace(/\]\]>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

function getTag(item, tag) {
  const match = item.match(
    new RegExp(
      `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`,
      "i"
    )
  );

  return match ? cleanText(match[1]) : "";
}

function calculateImportance(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();

  let score = 60;

  const veryImportantWords = [
    "world's first",
    "world first",
    "breakthrough",
    "major breakthrough",
    "record-breaking",
    "new record",
    "revolutionary",
    "discovery",
    "new technology",
    "new material",
    "new battery",
    "new reactor"
  ];

  const importantWords = [
    "engineering",
    "engineer",
    "robot",
    "robotics",
    "automation",
    "manufacturing",
    "semiconductor",
    "battery",
    "solar",
    "renewable",
    "energy",
    "infrastructure",
    "technology",
    "materials",
    "aerospace",
    "vehicle",
    "construction",
    "artificial intelligence",
    "machine learning",
    "electricity",
    "power",
    "carbon",
    "climate"
  ];

  veryImportantWords.forEach((word) => {
    if (text.includes(word)) {
      score += 8;
    }
  });

  importantWords.forEach((word) => {
    if (text.includes(word)) {
      score += 2;
    }
  });

  return Math.min(Math.max(score, 40), 99);
}

function detectCategory(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();

  if (
    text.includes("robot") ||
    text.includes("robotics") ||
    text.includes("automation")
  ) {
    return "Robotics";
  }

  if (
    text.includes("artificial intelligence") ||
    text.includes("machine learning") ||
    text.includes(" ai ") ||
    text.startsWith("ai ") ||
    text.includes("generative ai")
  ) {
    return "AI";
  }

  if (
    text.includes("solar") ||
    text.includes("battery") ||
    text.includes("renewable") ||
    text.includes("wind energy") ||
    text.includes("energy storage") ||
    text.includes("power generation") ||
    text.includes("hydrogen") ||
    text.includes("nuclear energy")
  ) {
    return "Energy";
  }

  if (
    text.includes("semiconductor") ||
    text.includes("electronic") ||
    text.includes("electronics") ||
    text.includes("chip") ||
    text.includes("circuit") ||
    text.includes("microprocessor") ||
    text.includes("sensor")
  ) {
    return "Electrical";
  }

  if (
    text.includes("material") ||
    text.includes("materials") ||
    text.includes("concrete") ||
    text.includes("metal") ||
    text.includes("alloy") ||
    text.includes("composite") ||
    text.includes("nanomaterial")
  ) {
    return "Materials";
  }

  if (
    text.includes("environment") ||
    text.includes("pollution") ||
    text.includes("carbon") ||
    text.includes("sustainable") ||
    text.includes("climate") ||
    text.includes("emissions") ||
    text.includes("waste")
  ) {
    return "Environmental";
  }

  if (
    text.includes("mechanical") ||
    text.includes("engine") ||
    text.includes("vehicle") ||
    text.includes("manufacturing") ||
    text.includes("machinery") ||
    text.includes("mechanism") ||
    text.includes("aerospace")
  ) {
    return "Mechanical";
  }

  return "Civil";
}

function createImpact(category) {
  const impacts = {
    Mechanical:
      "This development could improve the performance, efficiency or reliability of mechanical engineering systems.",

    Electrical:
      "This could contribute to improvements in electrical systems, electronics, power systems or future technology.",

    Energy:
      "This development could improve how energy is generated, stored, transported or used around the world.",

    Robotics:
      "More capable engineering systems could improve automation, manufacturing and other industrial processes.",

    AI:
      "AI-assisted engineering could help engineers analyse problems, improve designs and make better technical decisions.",

    Civil:
      "This development could influence the design, construction, safety or maintenance of infrastructure.",

    Materials:
      "New materials could improve engineering performance while potentially reducing cost, weight or environmental impact.",

    Environmental:
      "This could help engineers reduce environmental impact and develop more sustainable systems."
  };

  return impacts[category] || impacts.Civil;
}

function isRelevantArticle(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();

  const keywords = [
    "engineering",
    "engineer",
    "robot",
    "robotics",
    "automation",
    "manufacturing",
    "mechanical",
    "electrical",
    "electronics",
    "semiconductor",
    "battery",
    "solar",
    "renewable",
    "energy",
    "materials",
    "material",
    "construction",
    "infrastructure",
    "vehicle",
    "transportation",
    "aerospace",
    "technology",
    "artificial intelligence",
    "machine learning",
    "computer",
    "chip",
    "circuit",
    "3-d printing",
    "3d printing",
    "printing",
    "concrete",
    "metal",
    "alloy",
    "sustainable",
    "climate technology",
    "power",
    "electricity",
    "hydrogen",
    "nuclear",
    "sensor",
    "spacecraft",
    "aircraft"
  ];

  return keywords.some((keyword) =>
    text.includes(keyword)
  );
}

async function fetchFeed(url) {
  const cacheBuster = `_=${Date.now()}-${Math.random()}`;

  const response = await fetch(
    `${url}?${cacheBuster}`,
    {
      headers: {
        "User-Agent": "EngineeringPulse/1.0",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      `ScienceDaily returned HTTP ${response.status} for ${url}`
    );
  }

  return response.text();
}

function parseFeed(xml) {
  const matches = [
    ...xml.matchAll(
      /<item>([\s\S]*?)<\/item>/gi
    )
  ];

  return matches
    .map((match, index) => {
      const item = match[1];

      const title = getTag(item, "title");
      const url = getTag(item, "link");
      const summary = getTag(item, "description");
      const pubDate = getTag(item, "pubDate");

      if (!title || !url) {
        return null;
      }

      if (!isRelevantArticle(title, summary)) {
        return null;
      }

      const parsedDate = pubDate
        ? new Date(pubDate)
        : null;

      const timestamp =
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? parsedDate.getTime()
          : Date.now();

      const category = detectCategory(
        title,
        summary
      );

      return {
        id: `${timestamp}-${index}-${encodeURIComponent(url)}`,
        title,
        url,
        summary,
        source: "ScienceDaily",
        category,
        time:
          parsedDate && !Number.isNaN(parsedDate.getTime())
            ? parsedDate.toLocaleString()
            : "Recently",
        timestamp,
        importance: calculateImportance(
          title,
          summary
        ),
        impact: createImpact(category)
      };
    })
    .filter(Boolean);
}

export default async function handler() {
  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map((feed) =>
        fetchFeed(feed)
      )
    );

    const allArticles = [];

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const articles = parseFeed(result.value);
        allArticles.push(...articles);
      } else {
        console.error(
          "RSS feed failed:",
          result.reason
        );
      }
    });

    // Remove duplicate articles
    const uniqueArticles = [];
    const seenUrls = new Set();

    for (const article of allArticles) {
      if (seenUrls.has(article.url)) {
        continue;
      }

      seenUrls.add(article.url);
      uniqueArticles.push(article);
    }

    // Newest first
    uniqueArticles.sort(
      (a, b) =>
        (b.timestamp || 0) -
        (a.timestamp || 0)
    );

    // Keep the feed at a manageable size
    const articles = uniqueArticles.slice(0, 60);

    return new Response(
      JSON.stringify(articles),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      }
    );
  } catch (error) {
    console.error(
      "News function error:",
      error
    );

    return new Response(
      JSON.stringify({
        error: "Could not load engineering news.",
        details: error.message
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
```
