"use client";

import { useEffect, useMemo, useState } from "react";

const sessions = [
  { name: "ASIA", key: "asia", startHour: 0, endHour: 8 },
  { name: "LONDON", key: "london", startHour: 8, endHour: 16 },
  { name: "NEW YORK", key: "newyork", startHour: 13, endHour: 21 }
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

function getImpactClass(impact) {
  if (impact === "High") return "impact-high";
  if (impact === "Medium") return "impact-medium";
  return "impact-low";
}

function CandleBox({ title, countdown, statusText }) {
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
        <div className="backend-placeholder">
          {statusText}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [now, setNow] = useState(new Date());
  const [backendMessage, setBackendMessage] = useState("Checking cTrader backend...");
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await fetch("/api/candles", { cache: "no-store" });
        const data = await res.json();

        if (data.waiting) {
          setBackendReady(true);
          setBackendMessage(data.message);
          return;
        }

        if (!data.ok) {
          setBackendReady(false);
          setBackendMessage(data.error || "cTrader backend is not ready.");
          return;
        }

        setBackendReady(true);
        setBackendMessage("cTrader candle backend is ready.");
      } catch {
        setBackendReady(false);
        setBackendMessage("Could not reach cTrader backend.");
      }
    }

    checkBackend();
  }, []);

  const session = useMemo(() => getSessionState(now), [now]);

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
            <p>{backendReady ? "Backend prepared" : "Backend check"}</p>
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
          countdown={formatCountdown(getNextCandleClose(now, "Daily"))}
          statusText={backendMessage}
        />
        <CandleBox
          title="4H"
          countdown={formatCountdown(getNextCandleClose(now, "4H"))}
          statusText={backendMessage}
        />
        <CandleBox
          title="1H"
          countdown={formatCountdown(getNextCandleClose(now, "1H"))}
          statusText={backendMessage}
        />
      </section>
    </main>
  );
}
