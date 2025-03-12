import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW, cleanupServiceWorkers } from "./registerSW";

// Clean up old service workers first, then register the new one
(async () => {
  // In development mode, always clean up service workers to avoid caching issues
  if (import.meta.env.DEV) {
    await cleanupServiceWorkers();
  }
  registerSW();
})();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
