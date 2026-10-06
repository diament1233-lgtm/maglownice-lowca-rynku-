export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Dozwolona metoda: POST" });
  }

  try {
    const { query } = req.body || {};

    if (!query) {
      return res.status(400).json({ error: "Brak zapytania" });
    }

    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Brak klucza SERPER_API_KEY w ustawieniach Vercel"
      });
    }

    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: `${query} site:olx.pl`,
        gl: "pl",
        hl: "pl",
        num: 20
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const results = (data.organic || []).map(item => ({
      title: item.title || "",
      link: item.link || "",
      snippet: item.snippet || "",
      position: item.position || null
    }));

    return res.status(200).json({
      query,
      results
    });

  } catch (error) {
    return res.status(500).json({
      error: "Błąd wyszukiwania",
      details: error.message
    });
  }
}
