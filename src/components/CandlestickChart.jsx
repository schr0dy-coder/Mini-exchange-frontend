import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { getCandles } from "../api/api";

export default function CandlestickChart({ symbol }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [interval, setInterval] = useState("5min");

  // Create chart once
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#a1a1aa",
      },
      grid: {
        vertLines: { color: "#27272a" },
        horzLines: { color: "#27272a" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 350,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "#27272a",
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Load data whenever symbol changes
  useEffect(() => {
    if (!symbol || !seriesRef.current) return;

    async function loadData() {
      setLoading(true);
      try {
        seriesRef.current.setData([]);
        const candles = await getCandles(symbol, interval);

        const formatted = candles.map((c) => ({
          time: Math.floor(new Date(c.time).getTime() / 1000),
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
        }));

        seriesRef.current.setData(formatted);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [symbol, interval]);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
        {symbol} — Candlestick Chart
      </h2>
      <div className="flex gap-2 mb-3">
        {["1min", "5min", "15min", "1h", "1day"].map((tf) => (
          <button
            key={tf}
            onClick={() => setInterval(tf)}
            className={`px-3 py-1 text-xs rounded border
        ${
          interval === tf
            ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
            : "border-[var(--color-border)] text-[var(--color-text-muted)]"
        }
      `}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="relative">
        <div ref={chartContainerRef} />

        {loading && (
          <div
            className="absolute inset-0 flex items-center justify-center 
        text-[var(--color-text-muted)] text-sm 
        bg-[var(--color-surface)]/60 backdrop-blur-sm"
          >
            Loading candles…
          </div>
        )}
      </div>
    </div>
  );
}
