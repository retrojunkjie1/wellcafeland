import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { WcOsProvider } from "./core/WcOsProvider";

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

