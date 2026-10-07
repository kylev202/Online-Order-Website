import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' lets the built site be hosted from any folder (routing uses the URL hash).
export default defineConfig({
  plugins: [react()],
  base: './',
});
