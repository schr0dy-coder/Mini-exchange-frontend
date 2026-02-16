import { useEffect, useState } from "react";
import { getMyOrders, cancelOrder } from "../api/api";

function symbolDisplay(order) {
  const s = order.symbol;
  return typeof s === "string" ? s : s?.name ?? order.symbol_name ?? "—";
}

export default function OpenOrders({ token, symbol }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const load = async () => {
    try {
      setError(null);
      const data = await getMyOrders({ status: "OPEN,PARTIAL" });
      const list = Array.isArray(data) ? data : data?.results ?? data?.orders ?? [];
      setOrders(list);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [token, symbol]);

  const handleCancel = async (orderId) => {
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      setError(err.message || "Cancel failed");
    } finally {
      setCancellingId(null);
    }
  };

  const openOrders = symbol
    ? orders.filter((o) => symbolDisplay(o) === symbol)
    : orders;

  if (loading && orders.length === 0) {
    return (
      <div className="panel animate-fade-in rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
          Open Orders
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
        Open Orders{symbol ? ` — ${symbol}` : ""}
      </h2>
      <div className="px-5 pb-4">
        {error && (
          <p className="text-red-400 text-sm mb-2">{error}</p>
        )}
        <div className="max-h-[220px] overflow-y-auto">
          {openOrders.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] py-4">No open orders</p>
          ) : (
            <table className="w-full text-sm font-tabular">
              <thead>
                <tr className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)]">
                  <th className="text-left py-2 pr-2 font-medium">Side</th>
                  <th className="text-right py-2 px-2 font-medium">Price</th>
                  <th className="text-right py-2 px-2 font-medium">Size</th>
                  <th className="text-right py-2 pl-2 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {openOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-[var(--color-border)]/50 last:border-0"
                  >
                    <td
                      className={`py-2 pr-2 font-medium ${
                        o.side === "BUY" ? "text-[var(--color-bid)]" : "text-[var(--color-ask)]"
                      }`}
                    >
                      {o.side}
                    </td>
                    <td className="py-2 px-2 text-right text-[var(--color-text)]">
                      {Number(o.price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-2 px-2 text-right text-[var(--color-text)]">
                      {Number(o.remaining_quantity ?? o.quantity - (o.filled_quantity ?? 0)).toLocaleString()}
                    </td>
                    <td className="py-2 pl-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleCancel(o.id)}
                        disabled={cancellingId === o.id}
                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition-opacity"
                      >
                        {cancellingId === o.id ? "…" : "Cancel"}
                      </button>
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
