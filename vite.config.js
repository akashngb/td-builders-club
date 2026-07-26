import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: '/index.html',
    fs: { allow: ['.'] },
    // Cross-origin isolation — required for SharedArrayBuffer used by
    // @mkkellogg/gaussian-splats-3d's sorting worker.
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  // Big binary assets — don't try to inline
  assetsInclude: ['**/*.ply', '**/*.glb'],
});
