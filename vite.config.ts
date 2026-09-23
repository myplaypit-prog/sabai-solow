import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// 기본 빌드: 일반 정적 사이트(dist). artifact 모드: JS·CSS를 index.html 한 파일에 인라인(dist-artifact).
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'artifact' ? [react(), viteSingleFile()] : [react()],
  build: { outDir: mode === 'artifact' ? 'dist-artifact' : 'dist', assetsInlineLimit: mode === 'artifact' ? 100_000_000 : 4096 },
  test: { environment: 'node' },
}));
