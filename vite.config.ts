import { cloudflare } from '@cloudflare/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The Cloudflare plugin runs the API (worker/) inside the dev server, with a local database
// and image store, and builds the site and the API together for `wrangler deploy`.
export default defineConfig({
  plugins: [react(), cloudflare()],
});
