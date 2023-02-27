//import * as path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import zipPack from "vite-plugin-zip-pack";
//import { VitePWA } from 'vite-plugin-pwa';

//import manifest from './public/manifest.json';

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    react({
      jsxImportSource:'@emotion/react',
      babel:{
        plugins:['@emotion/babel-plugin']
      }
    }),
    zipPack({
      inDir: 'build',
      outDir: 'dist'
    })
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: "build",
    sourcemap: false,
  },
});
/*    /***VitePWA({
      manifest,
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      // switch to "true" to enable sw on development
      devOptions: {
        enabled: false,
      },
      workbox: {
        globPatterns: ['**/  //*.{js,css,html}', '**/*.{svg,png,jpg,gif}'],
  /*
      },
    }),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },*/