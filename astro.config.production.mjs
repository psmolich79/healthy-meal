import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import tailwind from '@tailwindcss/vite';

// Production configuration
export default defineConfig({
  // Base configuration
  site: process.env.SITE_URL || 'https://healthy-meal.com',
  base: process.env.BASE_PATH || '/',
  
  // Output configuration
  output: 'server',
  adapter: node({
    mode: 'standalone',
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 3000,
  }),
  
  // Build configuration
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto',
    split: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-avatar', '@radix-ui/react-slot'],
          'utils-vendor': ['clsx', 'class-variance-authority', 'tailwind-merge'],
          'framer-motion': ['framer-motion'],
        }
      }
    }
  },
  
  // Vite configuration for production
  vite: {
    plugins: [tailwind()],
    build: {
      target: 'es2020',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        mangle: {
          safari10: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom'],
            'ui': ['@radix-ui/react-avatar', '@radix-ui/react-slot'],
            'utils': ['clsx', 'class-variance-authority'],
          }
        }
      }
    },
    ssr: {
      noExternal: ['@radix-ui/react-avatar', '@radix-ui/react-slot']
    }
  },
  
  // Integrations
  integrations: [
    sitemap({
      filter: (page) => {
        // Exclude admin and private pages from sitemap
        return !page.includes('/admin') && !page.includes('/private');
      },
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  
  // Security headers
  experimental: {
    security: {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'same-origin',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      }
    }
  },
  
  // Image optimization
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Markdown configuration
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  
  // Environment variables validation
  env: {
    PUBLIC_SITE_URL: process.env.SITE_URL || 'https://healthy-meal.com',
    PUBLIC_API_URL: process.env.API_URL || 'https://api.healthy-meal.com',
    PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL || '',
    PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  },
  
  // Performance optimization
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    headers: {
      'X-Response-Time': 'true',
      'X-Request-ID': 'true',
    }
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
  },
  
  // Cache configuration
  cache: {
    enabled: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  
  // Compression
  compress: true,
  
  // Error pages
  redirects: {
    '/old-profile': '/profile',
    '/preferences': '/profile',
  },
  
  // 404 page
  notFound: '/404',
  
  // Robots.txt
  robots: {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/private', '/api'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/private'],
      },
    ],
    sitemap: true,
  },
  
  // PWA configuration (if needed)
  // pwa: {
  //   registerType: 'autoUpdate',
  //   workbox: {
  //     globPatterns: ['**/*.{js,css,svg,ico,png,avif}'],
  //     runtimeCaching: [
  //       {
  //         urlPattern: /^https:\/\/api\./,
  //         handler: 'NetworkFirst',
  //         options: {
  //           cacheName: 'api-cache',
  //           expiration: {
  //             maxEntries: 100,
  //             maxAgeSeconds: 60 * 60 * 24, // 24 hours
  //           },
  //         },
  //       },
  //     ],
  //   },
  // },
});
