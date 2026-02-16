import { useState, useEffect } from "react";
import OrderBook from "../components/OrderBook";
import OrderForm from "../components/OrderForm";
import PortfolioHoldings from "../components/PortfolioHoldings";
import OpenOrders from "../components/OpenOrders";
import TradeHistory from "../components/TradeHistory";
import SymbolSearch from "../components/SymbolSearch";
import CandlestickChart from "../components/CandlestickChart";
import { getSymbols, getCurrentUser } from "../api/api";

export default function Dashboard({ token, setToken }) {
  const [symbol, setSymbol] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);
  const [username, setUsername] = useState("");

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

    // Decode and set username from token
    const user = getCurrentUser();
    if (user && mounted) {
      setUsername(user);
    }

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
          <div className="flex items-center justify-between h-16">
            <h1 className="text-lg font-semibold tracking-tight">
              Mini Exchange
            </h1>

            <div className="flex items-center gap-6">
              <SymbolSearch
                value={symbol}
                onChange={setSymbol}
                placeholder="Search symbol…"
              />

              {/* Profile Card + Logout */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-border-focus)] transition-all duration-200">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center border border-[var(--color-accent)]/30">
                  <span className="text-sm font-semibold text-[var(--color-accent)]">
                    {username ? username[0].toUpperCase() : "?"}
                  </span>
                </div>

                {/* Username */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Logged in as
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text)] truncate">
                    {username || "User"}
                  </span>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-[var(--color-border)]" />

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="text-xs font-medium px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-150 active:scale-95 border border-red-500/20 hover:border-red-500/40"
                >
                  Log out
                </button>
              </div>
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
