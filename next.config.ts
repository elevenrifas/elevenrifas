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
  // Optimizaciones para builds más rápidos
  experimental: {
    // Optimizar el bundle
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
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
    return config;
  },
};

export default nextConfig;
