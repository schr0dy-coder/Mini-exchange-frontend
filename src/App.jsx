import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { BackendStatusProvider } from "./context/BackendStatusContext";
import BackendRebootMessage from "./components/BackendRebootMessage";

function App() {
  const [token, setToken] = useState(localStorage.getItem("access"));

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return <Dashboard token={token} setToken={setToken} />;
}

function App() {
  return (
    <BackendStatusProvider>
      <BackendRebootMessage />
      <AppContent />
    </BackendStatusProvider>
  );
}

export default App;

