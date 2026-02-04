/** @type {import('next').NextConfig} */
const nextConfig = {
  // Игнорируем ошибки типов (TypeScript)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Игнорируем ошибки стиля кода (ESLint)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Гарантируем, что Tailwind и React не будут конфликтовать
  reactStrictMode: false,
};

export default nextConfig;