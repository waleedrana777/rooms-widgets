import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The preview: every widget on a page, at sticker size, with its settings card.
export default defineConfig({ plugins: [react()] });
