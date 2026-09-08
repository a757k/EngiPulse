const RSS_URL =
  "https://www.sciencedaily.com/rss/top/technology.xml";

function cleanText(text = "") {
  return text
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function getTag(item, tag) {
  const match = item.match(
    new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i")
  );

  return match ? cleanText(match[1]) : "";
}

function calculateImportance(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();

  let score = 70;

  const importantWords = [
    "breakthrough",
    "major",
    "record",
    "world's first",
    "first",
    "revolutionary",
    "discovery",
    "developed",
    "innovation",
    "efficient",
    "renewable",
    "energy",
    "infrastructure",
    "technology",
    "robot",
    "engineering",
    "battery",
    "solar",
    "materials"
  ];

  importantWords.forEach((word) => {
    if (text.includes(word)) {
      score += 2;
    }
  });

  return Math.min(score, 99);
}

function detectCategory(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();

  if (
    text.includes("robot") ||
    text.includes("automation")
  ) {
    return "Robotics";
  }

  if (
    text.includes("solar") ||
    text.includes("battery") ||
    text.includes("renewable") ||
    text.includes("wind energy") ||
    text.includes("energy storage") ||
    text.includes("power generation")
  ) {
    return "Energy";
  }

  if (
    text.includes("artificial intelligence") ||
    text.includes("machine learning") ||
    text.includes(" ai ") ||
    text.startsWith("ai ")
  ) {
    return "AI";
  }

  if (
    text.includes("semiconductor") ||
    text.includes("electronic") ||
    text.includes("chip") ||
    text.includes("circuit")
  ) {
    return "Electrical";
  }

  if (
    text.includes("material") ||
    text.includes("concrete") ||
    text.includes("metal") ||
    text.includes("alloy")
  ) {
    return "Materials";
  }

  if (
    text.includes("environment") ||
    text.includes("pollution") ||
    text.includes("carbon") ||
    text.includes("sustainable") ||
    text.includes("climate")
  ) {
    return "Environmental";
  }

  if (
    text.includes("mechanical") ||
    text.includes("engine") ||
    text.includes("vehicle") ||
    text.includes("manufacturing")
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
      "This could contribute to improvements in electrical systems, electronics or future technology.",

    Energy:
      "This development could improve how energy is generated, stored or used around the world.",

    Robotics:
      "More capable engineering systems could improve automation, manufacturing and other industrial processes.",

    AI:
      "AI-assisted engineering could help engineers analyse problems, improve designs and make better decisions.",

    Civil:
      "This development could influence the design, construction, safety or maintenance of infrastructure.",

    Materials:
      "New materials could improve engineering performance while potentially reducing cost, weight or environmental impact.",

    Environmental:
      "This could help engineers reduce environmental impact and develop more sustainable systems."
  };

  return impacts[category] || impacts.Civil;
}

function isEngineeringArticle(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();

  const engineeringKeywords = [
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
    "electricity"
  ];

  return engineeringKeywords.some((keyword) =>
    text.includes(keyword)
  );
}

export default async function handler() {
  try {
    const response = await fetch(RSS_URL, {
      headers: {
        "User-Agent": "EngineeringPulse/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(
        `ScienceDaily returned HTTP ${response.status}`
      );
    }

    const xml = await response.text();

    const matches = [
      ...xml.matchAll(
        /<item>([\s\S]*?)<\/item>/gi
      )
    ];

    const articles = matches
      .map((match, index) => {
        const item = match[1];

        const title = getTag(item, "title");
        const url = getTag(item, "link");
        const summary = getTag(item, "description");
        const pubDate = getTag(item, "pubDate");

        if (!title || !url) {
          return null;
        }

        if (!isEngineeringArticle(title, summary)) {
          return null;
        }

        const category = detectCategory(
          title,
          summary
        );

        const timestamp = pubDate
          ? new Date(pubDate).getTime()
          : Date.now();

        return {
          id: `${timestamp}-${index}`,
          title,
          url,
          summary,
          source: "ScienceDaily",
          category,
          time: pubDate
            ? new Date(pubDate).toLocaleString()
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

    return new Response(
      JSON.stringify(articles),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300"
        }
      }
    );
  } catch (error) {
    console.error("News function error:", error);

    return new Response(
      JSON.stringify({
        error: "Could not load engineering news.",
        details: error.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}
