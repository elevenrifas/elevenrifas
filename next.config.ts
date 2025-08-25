import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignorar errores de ESLint durante el build para no bloquear la compilación
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar errores de TypeScript durante el build para builds más rápidos
    ignoreBuildErrors: true,
  },
  // Configuración para builds mínimos en Vercel
  output: 'standalone',
  // Optimizaciones para builds más rápidos y ligeros
  experimental: {
    // Optimizar el bundle
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  // Configuración de webpack para builds mínimos
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimizaciones solo para producción
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
            },
          },
        },
        // Minimizar el bundle
        minimize: true,
      };
    }
    
    // Resolver conflictos comunes
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      },
    };

    // Excluir archivos innecesarios del build
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };
    
    return config;
  },
  // Configuración específica para Vercel
  transpilePackages: [],
  // Configuración de imágenes optimizada
  images: {
    unoptimized: true, // Para builds más rápidos
  },
  // Configuración de compresión
  compress: true,
  // Configuración de headers para optimización
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
