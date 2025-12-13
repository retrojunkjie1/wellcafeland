import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { WcOsProvider } from "./core/WcOsProvider";
import { initTheme } from "@/theme/themeStore";

// Initialize theme before first render
initTheme();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <WcOsProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </WcOsProvider>
    </ErrorBoundary>
  </StrictMode>
);

