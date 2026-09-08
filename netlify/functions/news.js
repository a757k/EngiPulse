export default async () => {
  const rssUrl =
    "https://www.sciencedaily.com/rss/matter_energy/engineering_construction.xml";

  try {
    const response = await fetch(rssUrl);
    const xml = await response.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    const articles = items.map((match, index) => {
      const item = match[1];

      const get = (tag) => {
        const match = item.match(
          new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)
        );

        return match
          ? match[1]
              .replace("<![CDATA[", "")
              .replace("]]>", "")
              .trim()
          : "";
      };

      return {
        id: index + 1,
        title: get("title"),
        url: get("link"),
        summary: get("description"),
        source: "ScienceDaily",
        category: "Engineering",
        timestamp: new Date(get("pubDate")).getTime()
      };
    });

    return new Response(JSON.stringify(articles), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to load news" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};
