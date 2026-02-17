import { createContext, useState, useEffect, useCallback } from "react";
import { API_BASE } from "../api/api";

export const BackendStatusContext = createContext();

const HEALTH_CHECK_URL = `${API_BASE.replace(/\/api\/?$/, "")}/api/health/`;
const CHECK_INTERVAL_MS = 5000; // Check every 5 seconds
const TIMEOUT_MS = 3000; // 3 second timeout for health check

export function BackendStatusProvider({ children }) {
  const [isBackendDown, setIsBackendDown] = useState(false);
  const [checkCount, setCheckCount] = useState(0);

  const checkBackendHealth = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(HEALTH_CHECK_URL, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setIsBackendDown(false);
        setCheckCount(0);
      } else {
        setCheckCount((c) => c + 1);
        setIsBackendDown(true);
      }
    } catch (error) {
      setCheckCount((c) => c + 1);
      setIsBackendDown(true);
    }
  }, []);

  // Initial check when component mounts
  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  // Periodic checks
  useEffect(() => {
    const interval = setInterval(checkBackendHealth, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  return (
    <BackendStatusContext.Provider value={{ isBackendDown, checkCount }}>
      {children}
    </BackendStatusContext.Provider>
  );
}
