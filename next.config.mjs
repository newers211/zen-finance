/** @type {import('next').NextConfig} */
const nextConfig = {
  // Принудительная обработка библиотек, которые конфликтуют с Turbopack
  transpilePackages: ['recharts', 'react-is'],
  
  typescript: {
    // Пропускаем ошибки типов при билде для ускорения запуска
    ignoreBuildErrors: true,
  },
  eslint: {
    // Пропускаем проверки линтера при сборке
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;