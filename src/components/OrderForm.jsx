import { useState } from "react";
import { placeOrder } from "../api/api";

export default function OrderForm({ token, symbol }) {
  const [side, setSide] = useState("BUY");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: null, text: "" });

  const submit = async (e) => {
    e.preventDefault();
    const p = parseFloat(price);
    const q = parseInt(quantity, 10);
    if (!price || p <= 0 || !quantity || q < 1) {
      setMessage({ type: "error", text: "Enter a valid price and quantity." });
      return;
    }

    setMessage({ type: null, text: "" });
    setLoading(true);

    try {
      await placeOrder(token, { symbol, side, price: p, quantity: q });
      setMessage({ type: "success", text: "Order placed." });
      setPrice("");
      setQuantity("");
    } catch (err) {
      const text =
        err.data?.price?.[0] ||
        err.data?.quantity?.[0] ||
        err.data?.symbol?.[0] ||
        err.data?.detail ||
        err.message ||
        "Failed to place order.";
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 animate-fade-in transition-all duration-200 hover:border-[var(--color-border-focus)]">
      <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
        Place order — {symbol}
      </h2>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <span className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
            Side
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSide("BUY")}
              className={`py-2.5 px-4 rounded-[var(--radius)] font-medium text-sm transition-all duration-200 active:scale-[0.98] ${
                side === "BUY"
                  ? "bg-[var(--color-bid)]/20 text-[var(--color-bid)] border border-[var(--color-bid)]/40"
                  : "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-border-focus)]"
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setSide("SELL")}
              className={`py-2.5 px-4 rounded-[var(--radius)] font-medium text-sm transition-all duration-200 active:scale-[0.98] ${
                side === "SELL"
                  ? "bg-[var(--color-ask)]/20 text-[var(--color-ask)] border border-[var(--color-ask)]/40"
                  : "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-border-focus)]"
              }`}
            >
              Sell
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5"
          >
            Price
          </label>
          <input
            id="price"
            type="number"
            step="any"
            min="0"
            placeholder="0.00"
            className="w-full px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius)] text-[var(--color-text)] font-tabular focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)] transition-colors"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="quantity"
            className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5"
          >
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            step="1"
            placeholder="0"
            className="w-full px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius)] text-[var(--color-text)] font-tabular focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)] transition-colors"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={loading}
          />
        </div>

        {message.text && (
          <div
            className={`text-sm rounded-[var(--radius)] px-3 py-2 animate-fade-in ${
              message.type === "success"
                ? "text-green-400 bg-green-500/10 border border-green-500/20"
                : "text-red-400 bg-red-500/10 border border-red-500/20"
            }`}
            role="alert"
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 px-4 font-medium rounded-[var(--radius)] transition-all duration-200 active:scale-[0.98] disabled:active:scale-100 ${
            side === "BUY"
              ? "bg-[var(--color-bid)] hover:opacity-90 text-white disabled:opacity-50"
              : "bg-[var(--color-ask)] hover:opacity-90 text-white disabled:opacity-50"
          }`}
        >
          {loading ? "Placing…" : `Place ${side}`}
        </button>
      </form>
    </div>
  );
}
