import { useOrderBook } from "../hooks/useOrderBook";

function BookSide({ title, rows, isBid }) {
  const colorClass = isBid ? "text-[var(--color-bid)]" : "text-[var(--color-ask)]";
  const bgClass = isBid ? "bg-[var(--color-bid-bg)]" : "bg-[var(--color-ask-bg)]";

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden transition-all duration-200 hover:border-[var(--color-border-focus)]">
      <div
        className={`px-4 py-3 border-b border-[var(--color-border)] font-medium text-sm ${colorClass}`}
      >
        {title}
      </div>
      <div className="max-h-[320px] overflow-y-auto">
        {rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
            No orders
          </div>
        ) : (
          <table className="w-full text-sm font-tabular">
            <thead className="sticky top-0 bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)]">
              <tr className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
                <th className="text-left py-2 px-4 font-medium">Price</th>
                <th className="text-right py-2 px-4 font-medium">Size</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={`${row.price}-${i}`}
                  className={`border-b border-[var(--color-border)]/50 last:border-0 ${bgClass} transition-colors duration-150`}
                >
                  <td className={`py-2 px-4 ${colorClass}`}>
                    {Number(row.price).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-2 px-4 text-right text-[var(--color-text)]">
                    {Number(row.total_quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function OrderBook({ symbol }) {
  const { book, loading, error } = useOrderBook(symbol);

  if (loading && book.bids.length === 0 && book.asks.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[var(--color-text-muted)] animate-pulse-soft">
        Loading order book…
      </div>
    );
  }

  if (error && book.bids.length === 0 && book.asks.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-red-400 animate-fade-in">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-sm font-medium text-[var(--color-text-muted)]">
        Order book — {symbol}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BookSide title="Bids" rows={book.bids} isBid />
        <BookSide title="Asks" rows={book.asks} isBid={false} />
      </div>
    </div>
  );
}
