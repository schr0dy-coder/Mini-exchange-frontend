import { useEffect, useState } from "react";
import { getPortfolio, getHoldings } from "../api/api";

function formatMoney(n) {
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function symbolName(h) {
  return typeof h.symbol === "string" ? h.symbol : h.symbol?.name ?? "—";
}

export default function PortfolioHoldings({ token }) {
  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setError(null);
      const [p, h] = await Promise.all([getPortfolio(token), getHoldings(token)]);
      setPortfolio(p);
      setHoldings(Array.isArray(h) ? h : []);
    } catch (err) {
      setError(err.message || "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading && !portfolio) {
    return (
      <div className="panel animate-fade-in rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
          Portfolio & Holdings
        </h2>
        <div className="animate-pulse text-[var(--color-text-muted)] text-sm">
          Loading…
        </div>
      </div>
    );
  }

  if (error && !portfolio) {
    return (
      <div className="panel animate-fade-in rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
          Portfolio & Holdings
        </h2>
        <p className="text-red-400 text-sm">{error}</p>
        <button
          type="button"
          onClick={() => { setLoading(true); load(); }}
          className="mt-2 text-sm text-[var(--color-accent)] hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="panel animate-fade-in rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <h2 className="text-sm font-medium text-[var(--color-text-muted)] px-5 pt-5 pb-2">
        Portfolio & Holdings
      </h2>
      <div className="px-5 pb-4">
        <div className="flex flex-wrap gap-6 mb-4">
          <div>
            <span className="text-xs text-[var(--color-text-muted)] block">Available</span>
            <span className="font-tabular text-[var(--color-text)]">
              ${formatMoney(portfolio?.available_balance ?? 0)}
            </span>
          </div>
          <div>
            <span className="text-xs text-[var(--color-text-muted)] block">Reserved</span>
            <span className="font-tabular text-[var(--color-text-muted)]">
              ${formatMoney(portfolio?.reserved_balance ?? 0)}
            </span>
          </div>
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {holdings.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No holdings</p>
          ) : (
            <table className="w-full text-sm font-tabular">
              <thead>
                <tr className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)]">
                  <th className="text-left py-2 pr-3 font-medium">Symbol</th>
                  <th className="text-right py-2 px-3 font-medium">Available</th>
                  <th className="text-right py-2 pl-3 font-medium">Reserved</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h, i) => (
                  <tr
                    key={symbolName(h) + i}
                    className="border-b border-[var(--color-border)]/50 last:border-0 animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="py-2 pr-3 text-[var(--color-text)]">{symbolName(h)}</td>
                    <td className="py-2 px-3 text-right text-[var(--color-text)]">
                      {Number(h.available_quantity ?? 0).toLocaleString()}
                    </td>
                    <td className="py-2 pl-3 text-right text-[var(--color-text-muted)]">
                      {Number(h.reserved_quantity ?? 0).toLocaleString()}
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
