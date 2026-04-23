import { defineConfig } from "vite";

// base: "./" — relative asset URLs in dist/ (works with GitHub Pages + custom domain behringdx.health).
// --host 0.0.0.0 on dev/preview is optional if you want to hit the dev server from another device on the LAN.
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "assets"
  }
});
