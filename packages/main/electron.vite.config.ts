import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: resolve(__dirname, 'dist/main'),
      watch: {
        include: ['src/**'],
        exclude: ['**/node_modules/**']
      },
      lib: {
        entry: resolve(__dirname, 'src/index.ts')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      watch: {
        include: ['src/preload/**'],
        exclude: ['**/node_modules/**']
      },
      outDir: resolve(__dirname, 'dist/main/preload'),
      lib: {
        entry: resolve(__dirname, 'src/preload/index.ts')
      }
    }
  }
});
