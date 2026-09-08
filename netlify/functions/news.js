```js
const RSS_URL =
  "https://www.sciencedaily.com/rss/matter_energy/engineering_construction.xml";

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
    "new technology",
    "major",
    "record",
    "world's first",
    "first",
    "revolutionary",
    "discovery",
    "develop",
    "developed",
    "innovation",
    "efficient",
    "renewable",
    "energy",
    "infrastructure"
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
    text.includes("energy storage")
  ) {
    return "Energy";
  }

  if (
    text.includes("ai ") ||
    text.includes("artificial intelligence") ||
    text.includes("machine learning")
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
    text.includes("sustainable")
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

export default async () => {
  try {
    const response = await fetch(RSS_URL);

    if (!response.ok) {
      throw new Error(
        `ScienceDaily returned ${response.status}`
      );
    }

    const xml = await response.text();

    const matches = [
      ...xml.matchAll(
        /<item>([\s\S]*?)<\/item>/gi
      )
    ];

    const articles = matches.map((match, index) => {
      const item = match[1];

      const title = getTag(item, "title");
      const url = getTag(item, "link");
      const summary = getTag(item, "description");
      const pubDate = getTag(item, "pubDate");

      const category = detectCategory(
        title,
        summary
      );

      return {
        id: `${Date.now()}-${index}`,
        title,
        url,
        summary,
        source: "ScienceDaily",
        category,
        time: pubDate
          ? new Date(pubDate).toLocaleString()
          : "Recently",
        timestamp: pubDate
          ? new Date(pubDate).getTime()
          : Date.now(),
        importance: calculateImportance(
          title,
          summary
        ),
        impact: createImpact(category)
      };
    });

    return new Response(
      JSON.stringify(articles),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "public, max-age=300"
        }
      }
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error: "Could not load engineering news."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};
```
