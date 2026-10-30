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
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.js",
      include: ["src/**/*.test.{js,jsx}"],
      // Keep the JSDOM-heavy UI suite below the host's CPU limit. Give async
      // interactions enough headroom when two browser-like environments run.
      maxWorkers: 2,
      testTimeout: 15_000,
    },
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
      // Vite measures raw minified bytes: this route-only LiveKit chunk is 561 KB / 148 KB gzip.
      // Keep an explicit ceiling for this lazy media vendor instead of warning at the generic 500 KB mark.
      chunkSizeWarningLimit: 575,
      rollupOptions: {
        output: {
          manualChunks: {
            "framer-motion": ["framer-motion"],
            // Keep the growing country-scoped directory data out of the
            // shared fallback chunk so the two assets stay independently cacheable.
            "international-support-directory": ["./src/data/internationalSupportDirectory.js"],
            // Keep local catalog records in regional assets as the directory grows.
            // These are still loaded through the same static catalog imports, so lookup behavior is unchanged.
            "kentucky-minnesota-mississippi-directory": ["./src/data/kentuckyMississippiMinnesotaDirectory.js"],
            "maryland-directory": ["./src/data/marylandDirectory.js"],
            "massachusetts-directory": ["./src/data/massachusettsDirectory.js"],
            "north-carolina-support-directory": ["./src/data/northCarolinaSupportDirectory.js"],
            "midwest-mountain-state-directories": ["./src/data/midwestMountainDirectory.js"],
            "texas-local-resource-directory": [
              "./src/data/texasCitiesDirectory.js",
              "./src/data/texasCitiesBatchTwo.js",
              "./src/data/texasCitiesBatchThree.js",
              "./src/data/texasCitiesBatchFour.js",
              "./src/data/texasCitiesBatchFive.js",
              "./src/data/texasCitiesBatchSix.js",
              "./src/data/texasCitiesBatchSeven.js",
              "./src/data/texasCitiesBatchEight.js",
            ],
            "western-and-southern-state-directories": [
              "./src/data/coloradoCitiesDirectory.js",
              "./src/data/californiaDirectory.js",
              "./src/data/floridaDirectory.js",
              "./src/data/illinoisDirectory.js",
              "./src/data/georgiaDirectory.js",
              "./src/data/newYorkDirectory.js",
              "./src/data/ohioDirectory.js",
            ],
            "eastern-and-central-state-directories": [
              "./src/data/pennsylvaniaDirectory.js",
              "./src/data/arizonaDirectory.js",
              "./src/data/oklahomaDirectory.js",
              "./src/data/alabamaDirectory.js",
              "./src/data/alaskaDirectory.js",
              "./src/data/arkansasDirectory.js",
              "./src/data/connecticutDirectory.js",
            ],
            "nigeria-resource-directory": ["./src/data/nigeriaRecoveryDirectory.js"],
            "delaware-resource-directory": ["./src/data/delawareDirectory.js"],
            "hawaii-resource-directory": ["./src/data/hawaiiDirectory.js"],
            "idaho-resource-directory": ["./src/data/idahoDirectory.js"],
            "indiana-resource-directory": ["./src/data/indianaDirectory.js"],
            "iowa-resource-directory": ["./src/data/iowaDirectory.js"],
            "kansas-resource-directory": ["./src/data/kansasDirectory.js"],
            "louisiana-resource-directory": ["./src/data/louisianaDirectory.js"],
            "maine-resource-directory": ["./src/data/maineDirectory.js"],
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
