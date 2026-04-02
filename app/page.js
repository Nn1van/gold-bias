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
 
