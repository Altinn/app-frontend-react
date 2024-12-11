// vite.config.ts
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import nodePolyfills from 'rollup-plugin-node-polyfills'; // default import
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

function getCurrentGitBranchName() {
  const hasGitFolder = fs.existsSync('.git');
  if (!hasGitFolder) {
    return 'unknown-branch';
  }
  const gitHead = fs.readFileSync('.git/HEAD', 'utf-8');
  const ref = gitHead.match(/ref: refs\/heads\/([^\n]+)/);
  return ref ? ref[1] : 'unknown-branch';
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Replicate type-checking similar to ForkTsCheckerWebpackPlugin
    checker({ typescript: true }),
  ],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'],
  },
  server: {
    port: 8080,
    historyApiFallback: true,
    cors: true,
    open: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'X-Altinn-Frontend-Branch': getCurrentGitBranchName(),
    },
  },
  css: {
    modules: {
      // Matches the original css-loader config: exportLocalsConvention: 'camel-case'
      localsConvention: 'camelCase',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    // Prevent inline base64 URLs to mimic asset/resource usage
    assetsInlineLimit: 0,
    rollupOptions: {
      plugins: [
        // Apply node polyfills similar to NodePolyfillPlugin
        nodePolyfills(),
      ],
      output: {
        // Match the original filename
        entryFileNames: 'altinn-app-frontend.js',
        // Match the original CSS filename
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'altinn-app-frontend.css';
          }
          return '[name].[ext]';
        },
      },
    },
  },
}));
