import { useState } from "react";
import { placeOrder } from "../api/api";

export default function OrderForm({ token, symbol }) {
  const [side, setSide] = useState("BUY");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: null, text: "" });
  const [priceError, setPriceError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const p = parseFloat(price);
    const q = parseInt(quantity, 10);
    if (!price || p <= 0 || !quantity || q < 1) {
      setMessage({ type: "error", text: "Enter a valid price and quantity." });
      return;
    }

    setMessage({ type: null, text: "" });
    setPriceError(null);
    setLoading(true);

    try {
      await placeOrder(token, { symbol, side, price: p, quantity: q });
      setMessage({ type: "success", text: "Order placed." });
      setPrice("");
      setQuantity("");
    } catch (err) {
      const errorText =
        err.data?.price?.[0] ||
        err.data?.quantity?.[0] ||
        err.data?.symbol?.[0] ||
        err.data?.detail ||
        err.message ||
        "Failed to place order.";
      
      // Check if this is a price band error
      if (errorText.includes("outside valid range")) {
        const match = errorText.match(/Market price: \$([0-9.]+)\. Valid range: \$([0-9.]+) - \$([0-9.]+)/);
        if (match) {
          setPriceError({
            marketPrice: parseFloat(match[1]),
            minPrice: parseFloat(match[2]),
            maxPrice: parseFloat(match[3]),
          });
        }
      }
      
      setMessage({ type: "error", text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

          {message.text && !priceError && (
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

      {priceError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">
              Price Outside Valid Range
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Your order price is outside the allowed range.
            </p>
            
            <div className="bg-[var(--color-surface-elevated)] rounded-[var(--radius)] p-4 space-y-3 mb-6">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Current Market Price</p>
                <p className="text-lg font-semibold text-[var(--color-text)]">
                  ${priceError.marketPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Valid Price Range (±10%)</p>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  ${priceError.minPrice.toFixed(2)} — ${priceError.maxPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setPriceError(null);
                setMessage({ type: null, text: "" });
              }}
              className="w-full py-2.5 px-4 font-medium rounded-[var(--radius)] bg-[var(--color-bid)] hover:opacity-90 text-white transition-all duration-200 active:scale-[0.98]"
            >
              Adjust Price
            </button>
          </div>
        </div>
      )}
    </>
  );
}
