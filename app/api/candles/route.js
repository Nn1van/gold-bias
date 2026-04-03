export async function GET() {
  const clientId = process.env.CTRADER_CLIENT_ID;
  const clientSecret = process.env.CTRADER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return Response.json(
      {
        ok: false,
        source: "ctrader",
        error: "Missing cTrader credentials in Vercel environment variables."
      },
      { status: 500 }
    );
  }

  return Response.json(
    {
      ok: false,
      source: "ctrader",
      waiting: true,
      message:
        "Backend scaffold is ready, but your cTrader app is still waiting for approval. Real candles will be added after approval.",
      daily: [],
      fourH: [],
      oneH: []
    },
    { status: 200 }
  );
}
