import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
  plugins: [
    sveltekit(),
    tailwindcss(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      injectRegister: false,

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: 'Pitch App',
        short_name: 'Pitch App',
        description: 'Voice pitch tracker',
        theme_color: '#404040',
        background_color: '#404040',
        display: 'standalone',
      },

      workbox: {
        globPatterns: ['client/**/*.{js,css,ico,png,svg,wav,webp}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },

      devOptions: {
        enabled: false,
        suppressWarnings: true,
        navigateFallback: '/',
        navigateFallbackAllowlist: [/^\/$/],
        type: 'module',
      },
    }),
    basicSsl(),
    devtoolsJson(),
  ],
});
