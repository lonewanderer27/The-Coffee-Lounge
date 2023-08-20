import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [
    react(),
    legacy(),
    VitePWA({
      registerType: "prompt",
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
      },
    }),
  ],
  assetsInclude: ["**/*.lottie"],
});
