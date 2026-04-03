export async function GET() {
  const clientId = process.env.CTRADER_CLIENT_ID;
  const clientSecret = process.env.CTRADER_CLIENT_SECRET;

  return Response.json({
    ok: Boolean(clientId && clientSecret),
    hasClientId: Boolean(clientId),
    hasClientSecret: Boolean(clientSecret),
    message: clientId && clientSecret
      ? "cTrader backend scaffold is ready. Waiting for app approval before full live candle integration."
      : "Missing cTrader environment variables."
  });
}
