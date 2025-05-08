import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|webp|svg)$/i,
      exclude: undefined,
      include: undefined,
      includePublic: true,
      logStats: true,
      ansiColors: true,
      svg: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                cleanupNumericValues: false,
                removeViewBox: false,
              },
            },
          },
        ],
      },
      png: {
        quality: 75,
        speed: 4,
      },
      jpeg: {
        quality: 75,
        progressive: true,
        mozjpeg: true,
      },
      jpg: {
        quality: 75,
        progressive: true,
        mozjpeg: true,
      },
      webp: {
        lossless: false,
        quality: 75,
        alphaQuality: 80,
        method: 4, // 0 (fastest) to 6 (slowest)
        nearLossless: false,
        smartSubsample: true,
        effort: 5, // 0 (fastest) to 6 (slowest)
        loop: 0,
        delay: 100,
        minSize: true,
        mixed: true,
        preserveAlpha: true,
      },
      gif: {
        optimizationLevel: 3,
        interlaced: false,
      },
      cache: false, // Disable cache during development
    }),
  ],
  build: {
    // Enable source maps for better debugging
    sourcemap: true,
    // Configure asset handling
    assetsInlineLimit: 4096, // 4kb - files smaller than this will be inlined as base64
    // Configure chunk size warnings
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
        // Ensure assets are properly hashed
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split(".").at(1);
          if (/png|jpe?g|gif|webp|svg/i.test(extType)) {
            extType = "images";
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
      },
    },
  },
});
