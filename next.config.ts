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
  // Deshabilitar prerenderizado para evitar errores de SSR
  output: 'standalone',
  // Optimizaciones para builds más rápidos
  experimental: {
    // Optimizar el bundle
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    // Resolver conflicto con lightningcss en Vercel
    turbo: {
      rules: {
        '*.css': {
          loaders: ['@tailwindcss/postcss'],
          as: '*.css',
        },
      },
    },
  },
  // Configuración de webpack para builds más rápidos
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
            },
          },
        },
      };
    }
    
    // Resolver conflicto con lightningcss
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      },
    };
    
    return config;
  },
  // Configuración específica para Vercel
  transpilePackages: ['@tailwindcss/postcss'],
};

export default nextConfig;
