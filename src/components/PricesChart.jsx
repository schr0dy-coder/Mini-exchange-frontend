import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CHART_COLORS = [
  "var(--color-accent)",
  "var(--color-bid)",
  "#a78bfa",
  "#f59e0b",
];

export default function PricesChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [prevData, setPrevData] = useState([]);

  useEffect(() => {
    let ws;
    let cancelled = false;

    setLoading(true);
    setError(null);

    try {
      ws = new WebSocket("ws://127.0.0.1:8000/ws/prices/");

      ws.onopen = () => {
        if (!cancelled) setLoading(false);
      };

      ws.onmessage = (event) => {
        if (cancelled) return;

        try {
          const list = JSON.parse(event.data);

          const clean = (Array.isArray(list) ? list : []).map((d) => ({
            symbol: d.symbol,
            price: Number(d.price),
          }));

          setData((current) => {
            setPrevData(current);
            return clean;
          });

          setUpdatedAt(new Date());
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };

      ws.onerror = () => {
        if (!cancelled) setError("Realtime connection failed.");
      };

      ws.onclose = () => {
        console.log("Prices WS closed");
      };
    } catch (err) {
      setError("WebSocket not available.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
      if (ws) ws.close();
    };
  }, []);

  if (loading && data.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 animate-fade-in">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
          Market prices (delayed)
        </h2>
        <div className="h-64 flex items-center justify-center text-[var(--color-text-muted)] text-sm">
          Loading…
        </div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 animate-fade-in">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
          Market prices (delayed)
        </h2>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 animate-fade-in">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
          Market prices (delayed)
        </h2>
        <p className="text-[var(--color-text-muted)] text-sm">
          No price data yet. Prices update about every 60 minutes.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)]">
          Market prices (delayed)
        </h2>
        <span className="text-xs text-[var(--color-text-muted)]">
          Updated ~every 60 min
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
          >
            <XAxis
              dataKey="symbol"
              tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
            />
            <YAxis
              tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                v >= 1e6
                  ? `${(v / 1e6).toFixed(1)}M`
                  : v >= 1e3
                    ? `${(v / 1e3).toFixed(1)}k`
                    : String(v)
              }
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-surface-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
                color: "var(--color-text)",
              }}
              labelStyle={{ color: "var(--color-text-muted)" }}
              formatter={(value) => {
                if (!Number.isFinite(value)) return ["—", "Price"];
                return [
                  Number(value).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }),
                  "Price",
                ];
              }}
              labelFormatter={(label) => `Symbol: ${label}`}
            />
            <Bar
              dataKey="price"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
              isAnimationActive={true}
              animationDuration={400}
            >
              {data.map((d, i) => {
                const prev = prevData.find((p) => p.symbol === d.symbol);
                let className = "";

                if (prev) {
                  if (d.price > prev.price) className = "bar-up";
                  else if (d.price < prev.price) className = "bar-down";
                }

                return (
                  <Cell
                    key={d.symbol}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    className={className}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {updatedAt && (
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          Last update: {new Date(updatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
