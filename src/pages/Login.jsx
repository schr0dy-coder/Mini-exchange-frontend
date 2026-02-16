import { useState } from "react";
import { loginUser, registerUser } from "../api/api";

export default function Login({ setToken }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        setLoading(false);
        return;
      }
      try {
        await   User(username, password);
        setSuccess("Account created. Signing you in…");
        const data = await loginUser(username, password);
        if (data.access) {
          // Store tokens under `access`/`refresh` keys used by the API helper
          localStorage.setItem("access", data.access);
          localStorage.setItem("refresh", data.refresh);
          setToken(data.access);
        } else {
          setError("Account created. Please sign in.");
        }
      } catch (err) {
        setError(err.message || "Registration failed. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const data = await loginUser(username, password);
      if (data.access) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        setToken(data.access);
      } else {
        setError(data.detail || "Invalid credentials.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-accent)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--color-bid)]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-2xl p-8 transition-all duration-200 hover:border-[var(--color-border-focus)]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
              Mini Exchange
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {isSignUp ? "Create an account to trade" : "Sign in to trade"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-[var(--radius)] px-3 py-2"
                role="alert"
              >
                {error}
              </div>
            )}
            {success && (
              <div
                className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-[var(--radius)] px-3 py-2"
                role="status"
              >
                {success}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)] transition-colors"
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)] transition-colors"
                placeholder={isSignUp ? "At least 8 characters" : "Enter your password"}
                required
                minLength={isSignUp ? 8 : undefined}
                disabled={loading}
              />
            </div>

            {isSignUp && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)] transition-colors"
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-[var(--radius)] transition-all duration-200 active:scale-[0.98]"
            >
              {loading
                ? isSignUp
                  ? "Creating account…"
                  : "Signing in…"
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccess("");
              }}
              className="text-[var(--color-accent)] hover:underline font-medium"
            >
              {isSignUp ? "Sign in" : "Create account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
