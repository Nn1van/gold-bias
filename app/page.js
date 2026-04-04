"use client";

import { useEffect, useMemo, useState } from "react";

const sessions = [
  { name: "ASIA", key: "asia", startHour: 0, endHour: 8 },
  { name: "LONDON", key: "london", startHour: 8, endHour: 16 },
  { name: "NEW YORK", key: "newyork", startHour: 13, endHour: 21 }
];

const [news, setNews] = useState([]);

useEffect(() => {
  fetch("/api/news")
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) setNews(data.news);
    });
}, []);

function formatCountdown(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function getSessionState(now) {
  const hour = now.getHours();

  const active = sessions.find((s) => hour >= s.startHour && hour < s.endHour);

  if (active) {
    const end = new Date(now);
    end.setHours(active.endHour, 0, 0, 0);

    return {
      currentSession: active.name,
      currentSessionKey: active.key,
      countdown: end.getTime() - now.getTime()
    };
  }

  const next = sessions
    .map((s) => {
      const start = new Date(now);
      start.setHours(s.startHour, 0, 0, 0);
      if (start.getTime() <= now.getTime()) {
        start.setDate(start.getDate() + 1);
      }
      return { ...s, startTime: start };
    })
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0];

  return {
    currentSession: "CLOSED",
    currentSessionKey: "",
    countdown: next.startTime.getTime() - now.getTime()
  };
}

function getTimeframeMs(tf) {
  if (tf === "1H") return 60 * 60 * 1000;
  if (tf === "4H") return 4 * 60 * 60 * 1000;
  return 24 * 60 * 60 * 1000;
}

function getNextCandleClose(now, tf) {
  const ms = getTimeframeMs(tf);
  const next = Math.ceil(now.getTime() / ms) * ms;
  return next - now.getTime();
}

function makeFakeCandles(base, count) {
  const candles = [];
  let lastClose = base;

  for (let i = 0; i < count; i++) {
    const open = lastClose;
    const move = (Math.random() - 0.5) * 18;
    const close = Number((open + move).toFixed(2));
    const high = Number((Math.max(open, close) + Math.random() * 8).toFixed(2));
    const low = Number((Math.min(open, close) - Math.random() * 8).toFixed(2));

    candles.push({
      open: Number(open.toFixed(2)),
      high,
      low,
      close
    });

    lastClose = close;
  }

  return candles.reverse();
}

function getImpactClass(impact) {
  if (impact === "High") return "impact-high";
  if (impact === "Medium") return "impact-medium";
  return "impact-low";
}

function CandleStick({ candle, minLow, maxHigh }) {
  const bullish = candle.close >= candle.open;
  const colorClass = bullish ? "candle-up" : "candle-down";
  const totalRange = Math.max(maxHigh - minLow, 0.0001);

  const wickTop = ((maxHigh - candle.high) / totalRange) * 220;
  const wickBottom = ((maxHigh - candle.low) / totalRange) * 220;

  const bodyTopPrice = Math.max(candle.open, candle.close);
  const bodyBottomPrice = Math.min(candle.open, candle.close);

  const bodyTop = ((maxHigh - bodyTopPrice) / totalRange) * 220;
  const bodyBottom = ((maxHigh - bodyBottomPrice) / totalRange) * 220;
  const bodyHeight = Math.max(bodyBottom - bodyTop, 8);
  const wickHeight = Math.max(wickBottom - wickTop, 12);

  return (
    <div className="tv-candle">
      <div className="tv-candle-area">
        <div
          className={`tv-wick ${colorClass}`}
          style={{
            top: `${wickTop}px`,
            height: `${wickHeight}px`
          }}
        />
        <div
          className={`tv-body ${colorClass}`}
          style={{
            top: `${bodyTop}px`,
            height: `${bodyHeight}px`
          }}
        />
      </div>
    </div>
  );
}

function CandleChart({ candles }) {
  const minLow = Math.min(...candles.map((c) => c.low));
  const maxHigh = Math.max(...candles.map((c) => c.high));

  return (
    <div className="tv-chart">
      <div className="tv-chart-inner">
        {candles.map((candle, index) => (
          <CandleStick
            key={index}
            candle={candle}
            minLow={minLow}
            maxHigh={maxHigh}
          />
        ))}
      </div>
    </div>
  );
}

function CandleBox({ title, candles, countdown, notice }) {
  return (
    <div className="card">
      <div className="box-top">
        <div>
          <h3>{title}</h3>
          <p>Latest 3 candles</p>
        </div>
        <div className="mini-timer">{countdown}</div>
      </div>

      <div className="chart-shell">
        <CandleChart candles={candles} />
      </div>

      <div className="candle-notice">
        {notice}
      </div>
    </div>
  );
}

export default function Page() {
  const [now, setNow] = useState(new Date());
  const [backendMessage, setBackendMessage] = useState("Checking cTrader backend...");
  const [usingRealCandles, setUsingRealCandles] = useState(false);

  const [dailyCandles, setDailyCandles] = useState(() => makeFakeCandles(2325, 3));
  const [fourHCandles, setFourHCandles] = useState(() => makeFakeCandles(2318, 3));
  const [oneHCandles, setOneHCandles] = useState(() => makeFakeCandles(2312, 3));

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadCandles() {
      try {
        const res = await fetch("/api/candles", { cache: "no-store" });
        const data = await res.json();

        if (data.ok && data.daily?.length && data.fourH?.length && data.oneH?.length) {
          setDailyCandles(data.daily);
          setFourHCandles(data.fourH);
          setOneHCandles(data.oneH);
          setUsingRealCandles(true);
          setBackendMessage("Live cTrader candles are active.");
          return;
        }

        setUsingRealCandles(false);
        setBackendMessage(data.message || "Using demo candles for now.");
      } catch {
        setUsingRealCandles(false);
        setBackendMessage("Could not reach cTrader backend. Using demo candles.");
      }
    }

    loadCandles();
  }, []);

  const session = useMemo(() => getSessionState(now), [now]);

  const candleNotice = usingRealCandles
    ? "Live cTrader candles"
    : backendMessage;

  return (
    <main className="page">
      <section className="hero">
        <h1>
          <span className="gold-glow-word">Gold</span> Bias
        </h1>
        <p>Simple gold page for sessions, bias, news, and candles.</p>
      </section>

      <section className="card market-session-card">
        <h2 className="market-session-title">Market Sessions</h2>

        <div className="market-session-row">
          {sessions.map((sessionItem) => (
            <div
              key={sessionItem.name}
              className={`market-session-box ${
                session.currentSessionKey === sessionItem.key
                  ? `session-active session-${sessionItem.key}`
                  : ""
              }`}
            >
              {sessionItem.name}
            </div>
          ))}
        </div>

        <div className="market-session-timer-wrap">
          <div className="market-session-timer">
            {formatCountdown(session.countdown)}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-top">
          <div>
            <h2>cTrader Backend</h2>
            <p>{usingRealCandles ? "Live" : "Fallback mode"}</p>
          </div>
        </div>

        <div className="small-card">
          <strong>{backendMessage}</strong>
        </div>
      </section>

      <section className="card">
        <div className="section-top">
          <div>
            <h2>USD News</h2>
            <p>Starter news list for now</p>
          </div>
        </div>

        <div className="news-list">
          {starterNews.map((item) => (
            <div key={item.id} className="news-item">
              <div>
                <div className="news-time">{item.time} • USD</div>
                <div className="news-title">{item.title}</div>
              </div>
              <div className={`impact ${getImpactClass(item.impact)}`}>
                {item.impact}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="candle-grid-main">
        <CandleBox
          title="Daily"
          candles={dailyCandles}
          countdown={formatCountdown(getNextCandleClose(now, "Daily"))}
          notice={candleNotice}
        />
        <CandleBox
          title="4H"
          candles={fourHCandles}
          countdown={formatCountdown(getNextCandleClose(now, "4H"))}
          notice={candleNotice}
        />
        <CandleBox
          title="1H"
          candles={oneHCandles}
          countdown={formatCountdown(getNextCandleClose(now, "1H"))}
          notice={candleNotice}
        />
      </section>
    </main>
  );
}
