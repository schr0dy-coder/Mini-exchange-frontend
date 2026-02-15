import { useEffect, useState } from "react";
import { getOrderBook, WS_ORIGIN } from "../api/api";

const POLL_INTERVAL_MS = 2000;

function getOrderBookWsUrl(symbol) {
  return `${WS_ORIGIN.replace(/\/$/, "")}/ws/orderbook/?symbol=${encodeURIComponent(symbol)}`;
}

export function useOrderBook(symbol) {
  const [book, setBook] = useState({ bids: [], asks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useWs, setUseWs] = useState(false);

  useEffect(() => {
    if (!symbol) {
      setBook({ bids: [], asks: [] });
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    setUseWs(false);

    let cancelled = false;
    let ws = null;
    let pollTimer = null;

    async function fetchBook() {
      try {
        const data = await getOrderBook(symbol);
        if (!cancelled) setBook(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load order book");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBook();
    pollTimer = setInterval(fetchBook, POLL_INTERVAL_MS);

    const wsUrl = getOrderBookWsUrl(symbol);
    if (wsUrl) {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (cancelled) return;
          if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
          }
          setUseWs(true);
        };

        ws.onmessage = (event) => {
          if (cancelled) return;
          try {
            const data = JSON.parse(event.data);
            if (data && (Array.isArray(data.bids) || Array.isArray(data.asks))) {
              setBook({
                bids: data.bids || [],
                asks: data.asks || [],
              });
            }
          } catch (_) {}
        };

        ws.onclose = () => {
          if (!cancelled && !pollTimer)
            pollTimer = setInterval(fetchBook, POLL_INTERVAL_MS);
        };

        ws.onerror = () => {
          if (!cancelled && !pollTimer)
            pollTimer = setInterval(fetchBook, POLL_INTERVAL_MS);
        };
      } catch (_) {
        // keep polling
      }
    }

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [symbol]);

  return { book, loading, error, useWs };
}
