import { useState, useEffect } from "react";
import OrderBook from "../components/OrderBook";
import OrderForm from "../components/OrderForm";
import PortfolioHoldings from "../components/PortfolioHoldings";
import OpenOrders from "../components/OpenOrders";
import TradeHistory from "../components/TradeHistory";
import SymbolSearch from "../components/SymbolSearch";
import CandlestickChart from "../components/CandlestickChart";
import { getSymbols } from "../api/api";

export default function Dashboard({ token, setToken }) {
  const [symbol, setSymbol] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    let mounted = true;

    getSymbols()
      .then((list) => {
        if (!mounted) return;
        const names = Array.isArray(list) ? list : [];
        if (names.length > 0) {
          setSymbol(names[0]);
        }
      })
      .finally(() => {
        if (mounted) setInitialLoad(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setToken(null);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-20 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-lg font-semibold tracking-tight">
              Mini Exchange
            </h1>

            <div className="flex items-center gap-4">
              <SymbolSearch
                value={symbol}
                onChange={setSymbol}
                placeholder="Search symbol…"
              />

              <button
                onClick={logout}
                className="
    text-sm font-medium
    px-3 py-1.5
    rounded-md
    bg-[var(--color-surface-elevated)]
    border border-[var(--color-border)]
    text-[var(--color-text-muted)]
    hover:text-[var(--color-text)]
    hover:border-[var(--color-border-focus)]
    transition-all duration-200
    active:scale-95
  "
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        {/* Empty State */}
        {!symbol && !initialLoad && (
          <div className="text-center py-16 text-[var(--color-text-muted)]">
            No symbols found. Add symbols in Django admin.
          </div>
        )}

        {!symbol && initialLoad && (
          <div className="text-center py-16 text-[var(--color-text-muted)]">
            Loading…
          </div>
        )}

        {symbol && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* ========== LEFT 3/4 AREA ========== */}
            <div className="xl:col-span-3 space-y-6">
              {/* Candle Chart */}
              <CandlestickChart symbol={symbol} />

              {/* Order Book + Order Form */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Book */}
                <div className="lg:col-span-2">
                  <OrderBook symbol={symbol} />
                </div>

                {/* Order Form */}
                <div>
                  <OrderForm token={token} symbol={symbol} />
                </div>
              </div>

              {/* Open Orders + Trade History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <OpenOrders token={token} symbol={symbol} />
                <TradeHistory token={token} symbol={symbol} />
              </div>
            </div>

            {/* ========== RIGHT SIDEBAR ========== */}
            <div className="space-y-6">
              <PortfolioHoldings token={token} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
