import { useEffect, useState } from "react";
import { getMyTrades } from "../api/api";

function formatTime(createdAt) {
  if (!createdAt) return "—";
  const d = new Date(createdAt);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function symbolDisplay(trade) {
  const s = trade.symbol;
  return typeof s === "string" ? s : s?.name ?? trade.symbol_name ?? "—";
}

export default function TradeHistory({ token, symbol }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setError(null);
      const params = symbol ? { symbol } : {};
      const data = await getMyTrades(token, params);
      const list = Array.isArray(data) ? data : data?.results ?? data?.trades ?? [];
      setTrades(list);
    } catch (err) {
      setError(err.message || "Failed to load trades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [token, symbol]);

  if (loading && trades.length === 0) {
    return (
      <div className="panel animate-fade-in rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
          Trade History
        </h2>
        <div className="animate-pulse text-[var(--color-text-muted)] text-sm">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="panel animate-fade-in rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <h2 className="text-sm font-medium text-[var(--color-text-muted)] px-5 pt-5 pb-2">
        Trade History{symbol ? ` — ${symbol}` : ""}
      </h2>
      <div className="px-5 pb-4">
        {error && (
          <p className="text-red-400 text-sm mb-2">{error}</p>
        )}
        <div className="max-h-[240px] overflow-y-auto">
          {trades.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] py-4">No trades yet</p>
          ) : (
            <table className="w-full text-sm font-tabular">
              <thead>
                <tr className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)]">
                  <th className="text-left py-2 pr-2 font-medium">Time</th>
                  <th className="text-left py-2 px-2 font-medium">Symbol</th>
                  <th className="text-left py-2 px-2 font-medium">Side</th>
                  <th className="text-right py-2 px-2 font-medium">Price</th>
                  <th className="text-right py-2 pl-2 font-medium">Qty</th>
                </tr>
              </thead>
              <tbody>
                {[...trades]
                  .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                  .slice(0, 50)
                  .map((t, i) => (
                    <tr
                      key={t.id ?? i}
                      className="border-b border-[var(--color-border)]/50 last:border-0 trade-row"
                    >
                      <td className="py-1.5 pr-2 text-[var(--color-text-muted)] whitespace-nowrap">
                        {formatTime(t.created_at)}
                      </td>
                      <td className="py-1.5 px-2 text-[var(--color-text)]">
                        {symbolDisplay(t)}
                      </td>
                      <td
                        className={`py-1.5 px-2 font-medium ${
                          t.side === "BUY" ? "text-[var(--color-bid)]" : "text-[var(--color-ask)]"
                        }`}
                      >
                        {t.side ?? "—"}
                      </td>
                      <td className="py-1.5 px-2 text-right text-[var(--color-text)]">
                        {Number(t.price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-1.5 pl-2 text-right text-[var(--color-text)]">
                        {Number(t.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
