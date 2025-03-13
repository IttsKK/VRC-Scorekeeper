import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/vrcscorekeeper/",

  server: {
    // Add headers to prevent caching during development
    headers: {
      "Cache-Control": "no-store",
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "index.html",
      },
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "masked-icon.svg",
        "images/ring.png",
        "images/corner_negative.svg",
        "images/corner_positive.svg",
        "images/ring_negative.svg",
        "images/ring_positive.svg",
      ],
      manifest: {
        name: "VRC Scorekeeper",
        short_name: "VRC Scorekeeper",
        description: "Track VRC matches in real-time",
        theme_color: "#000000",
        background_color: "#000000",
        display: "fullscreen",
        orientation: "portrait",
        start_url: "/vrcscorekeeper/",
        icons: [
          {
            src: "images/ring.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "images/ring.png",
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
  // Explicitly configure public directory handling
  publicDir: "public",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    // Ensure assets from public directory are copied to the build
    copyPublicDir: true,
  },
});
