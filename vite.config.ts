import { cloudflare } from '@cloudflare/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The Cloudflare plugin runs the API (worker/) inside the dev server, with a local database
// and image store, and builds the site and the API together for `wrangler deploy`.
// `--mode pages` builds the GitHub Pages preview instead: the website alone, with the API replaced by
// a stand-in that runs in the browser (src/lib/demoApi.ts), hostable from any folder.
export default defineConfig(({ mode }) => (mode === 'pages' ? { plugins: [react()], base: './' } : { plugins: [react(), cloudflare()] }));
