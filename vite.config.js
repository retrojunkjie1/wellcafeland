import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const projectId = env.VITE_FIREBASE_PROJECT_ID || "your-project-id";
  const region = env.VITE_FUNCTIONS_REGION || "us-central1";
  const port = env.VITE_FUNCTIONS_EMULATOR_PORT || "5001";
  const functionsBase = `http://127.0.0.1:${port}/${projectId}/${region}`;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: false,
      proxy: {
        "/api": {
          target: functionsBase,
          changeOrigin: true,
          secure: false,
          rewrite: (p) => {
            const [pathname, search] = String(p || "").split("?");
            const qs = search ? `?${search}` : "";
            if (pathname === "/api/aiSession" || pathname.startsWith("/api/aiSession")) {
              return `/aiSession${qs}`;
            }
            if (pathname === "/api/globalResourceSearch" || pathname.startsWith("/api/globalResourceSearch")) {
              return `/globalResourceSearch${qs}`;
            }
            return p.replace(/^\/api\/?/, "/");
          },
        },
        "/aiSession": {
          target: functionsBase,
          changeOrigin: true,
          secure: false,
          rewrite: (p) => (p.replace(/^\/aiSession/, "/aiSession")),
        },
        "/globalResourceSearch": {
          target: functionsBase,
          changeOrigin: true,
          secure: false,
          rewrite: (p) => (p.replace(/^\/globalResourceSearch/, "/globalResourceSearch")),
        },
      },
      headers: {
        "Content-Security-Policy": "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:* https://localhost:* http://192.168.*:*; object-src 'none'; base-uri 'self';",
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "framer-motion": ["framer-motion"],
            "luxury-ui": [
              "./src/components/layout/AmbientOrbs",
              "./src/components/explore/CategoryChips",
              "./src/components/explore/ToolCard",
              "./src/theme/luxuryTheme",
            ],
          },
        },
      },
    },
  };
});
