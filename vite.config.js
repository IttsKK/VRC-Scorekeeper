import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    // Add headers to prevent caching during development
    headers: {
      "Cache-Control": "no-store",
    },
  },
  plugins: [
    react(),
    tailwindcss(), // Add Tailwind plugin here
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "index.html",
      },
      includeAssets: [
        "/images/ring.png",
        "apple-touch-icon.png",
        "masked-icon.svg",
      ],
      manifest: {
        name: "VEX Score Tracker",
        short_name: "VEX Tracker",
        description: "Track VEX competition scores in real-time",
        theme_color: "#000000",
        background_color: "#000000",
        display: "fullscreen",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/images/ring.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/images/ring.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Improved caching strategy
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache all page navigations
            urlPattern: /\/$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
          {
            // Cache CSS/JS assets
            urlPattern: /\.(?:js|css)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
            },
          },
          {
            // Cache images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // API calls
            urlPattern: /^https?:\/\/api\..*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        navigateFallback: "/offline.html",
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globIgnores: [
          "**/*.map",
          "**/node_modules/**/*",
          "sw.js",
          "workbox-*.js",
        ],
      },
    }),
  ],
});
