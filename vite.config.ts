import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
    ],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
    },
    server: {
      port: 8080,
      strictPort: true,
      host: true,
      watch: {
        usePolling: true,
      },
    },
    preview: {
      port: 8080,
      strictPort: true,
      host: true,
    },
    build: {
      target: 'es2015',
      minify: 'terser',
      terserOptions: {
      compress: {
        drop_console: true, // Remove console.log em produção
        drop_debugger: true
      }
    },
    // Code splitting manual para melhor controle
    rollupOptions: {
      output: {
        manualChunks: {
          // Bibliotecas principais do React
          'react-vendor': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          
          // Bibliotecas de UI
          'ui-vendor': ['@radix-ui/react-avatar', '@radix-ui/react-slot', '@radix-ui/react-dialog'],
          'lucide': ['lucide-react'],
          
          // Bibliotecas de gráficos e visualização (removido chart.js - não instalado)
          // 'charts': ['chart.js', 'react-chartjs-2'],
          
          // Bibliotecas de formulários
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Bibliotecas de data/estado (removido zustand - não instalado)
          'data': ['@tanstack/react-query'],
          
          // Utilitários
          'utils': ['clsx', 'class-variance-authority', 'tailwind-merge']
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || ['asset'];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    chunkSizeWarningLimit: 1000, // 1MB de aviso
    sourcemap: process.env.NODE_ENV === 'development'
  },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    // Otimizações de desenvolvimento
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: ['@vite/client', '@vite/env'],
    },
  };
});
