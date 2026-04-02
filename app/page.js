"use client";

import { useEffect, useMemo, useState } from "react";

const sessions = [
  { name: "Asia", startHour: 0, endHour: 8 },
  { name: "London", startHour: 8, endHour: 16 },
  { name: "New York", startHour: 13, endHour: 21 }
];

const starterNews = [
  { id: 1, time: "08:30", title: "USD Core CPI m/m", impact: "High" },
  { id: 2, time: "10:00", title: "USD Fed Chair Speaks", impact: "High" },
  { id: 3, time: "14:00", title: "USD Crude Oil Inventories", impact: "Medium" },
  { id: 4, time: "16:00", title: "USD Unemployment Claims", impact: "High" }
];

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
      label: `${active.name} closes in`,
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
    currentSession: "Closed",
    label: `${next.name} opens in`,
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
    const move = (Math.random() - 0.5) * 25;
    const close = Number((open + move).toFixed(2));
    const high = Number((Math.max(open, close) + Math.random() * 10).toFixed(2));
    const low = Number((Math.min(open, close) - Math.random() * 10).toFixed(2));

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

function getBiasFromCandles(candles) {
  const last = candles[candles.length - 1];
  if (last.close > last.open) return "Bullish";
  if (last.close < last.open) return "Bearish";
  return "Neutral";
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

function CandleBox({ title, candles, countdown }) {
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
    </div>
  );
}

export default function Page() {
  const [now, setNow] = useState(new Date());
  const [dailyCandles] = useState(() => makeFakeCandles(2325, 3));
  const [fourHCandles] = useState(() => makeFakeCandles(2318, 3));
  const [oneHCandles] = useState(() => makeFakeCandles(2312, 3));

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const session = useMemo(() => getSessionState(now), [now]);

  const dailyBias = getBiasFromCandles(dailyCandles);
  const fourHBias = getBiasFromCandles(fourHCandles);
  const oneHBias = getBiasFromCandles(oneHCandles);

  return (
    <main className="page">
      <section className="hero">
        <h1>
          <span className="gold-glow-word">Gold</span> Bias
        </h1>
        <p>Simple gold page for sessions, bias, news, and candles.</p>
      </section>

      <section className="card">
        <div className="section-top">
          <div>
            <h2>Market Sessions</h2>
            <p>One countdown for Asia, London, and New York</p>
          </div>
          <div className="session-now">
            <span>Current</span>
            <strong>{session.currentSession}</strong>
          </div>
        </div>

        <div className="session-grid">
          {sessions.map((sessionItem) => (
            <div key={sessionItem.name} className="small-card">
              <span>Session</span>
              <strong>{sessionItem.name}</strong>
            </div>
          ))}

          <div className="small-card gold-card">
            <span>{session.label}</span>
            <strong>{formatCountdown(session.countdown)}</strong>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-top">
          <div>
            <h2>Bias Strength</h2>
            <p>Based on Daily, 4H, and 1H</p>
          </div>
        </div>

        <div className="bias-grid">
          <div className="small-card">
            <span>Daily</span>
            <strong>{dailyBias}</strong>
          </div>
          <div className="small-card">
            <span>4H</span>
            <strong>{fourHBias}</strong>
          </div>
          <div className="small-card">
            <span>1H</span>
            <strong>{oneHBias}</strong>
          </div>
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
        />
        <CandleBox
          title="4H"
          candles={fourHCandles}
          countdown={formatCountdown(getNextCandleClose(now, "4H"))}
        />
        <CandleBox
          title="1H"
          candles={oneHCandles}
          countdown={formatCountdown(getNextCandleClose(now, "1H"))}
        />
      </section>
    </main>
  );
}
