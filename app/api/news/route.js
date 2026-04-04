export async function GET() {
  try {
    const apiKey = process.env.FMP_API_KEY;

    const res = await fetch(
      `https://financialmodelingprep.com/api/v3/economic_calendar?apikey=${apiKey}`
    );

    const data = await res.json();

    // Filter USD only + clean format
    const usdNews = data
      .filter((item) => item.country === "US")
      .slice(0, 10)
      .map((item) => ({
        time: new Date(item.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        title: item.event,
        impact:
          item.importance === 3
            ? "high"
            : item.importance === 2
            ? "medium"
            : "low",
        actual: item.actual,
        forecast: item.forecast,
        previous: item.previous,
      }));

    return Response.json({ ok: true, news: usdNews });
  } catch (err) {
    return Response.json({ ok: false, error: "Failed to fetch news" });
  }
}
